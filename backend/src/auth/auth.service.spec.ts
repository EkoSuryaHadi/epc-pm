import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password if credentials are valid', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Test User',
        role: 'ADMIN',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true as any));

      const result = await service.validateUser('test@example.com', 'password123');

      expect(result).toBeDefined();
      expect(result.email).toBe('test@example.com');
      expect(result.password).toBeUndefined();
    });

    it('should throw error if user is not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.validateUser('notfound@example.com', 'password123')
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error if password is incorrect', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Test User',
        role: 'ADMIN',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false as any));

      await expect(
        service.validateUser('test@example.com', 'wrongpassword')
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('login', () => {
    it('should return access token and user info', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'ADMIN',
      };

      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      const result = await service.login(mockUser);

      expect(result).toBeDefined();
      expect(result.access_token).toBe('mock-jwt-token');
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(mockUser.email);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser.id,
        role: mockUser.role,
      });
    });
  });

  describe('register', () => {
    it('should create new user with hashed password', async () => {
      const registerDto = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
        role: 'PROJECT_MANAGER',
      };

      const hashedPassword = await bcrypt.hash(registerDto.password, 10);
      const mockCreatedUser = {
        id: '2',
        email: registerDto.email,
        name: registerDto.name,
        role: registerDto.role,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve(hashedPassword as any));
      mockUsersService.create.mockResolvedValue(mockCreatedUser);

      const result = await service.register(
        registerDto.email,
        registerDto.password,
        registerDto.name,
        registerDto.role
      );

      expect(result).toBeDefined();
      expect(result.email).toBe(registerDto.email);
      expect(mockUsersService.create).toHaveBeenCalled();
    });

    it('should throw error if email already exists', async () => {
      const registerDto = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Existing User',
        role: 'ADMIN',
      };

      mockUsersService.create.mockRejectedValue(
        new Error('Unique constraint failed on the fields: (`email`)')
      );

      await expect(
        service.register(
          registerDto.email,
          registerDto.password,
          registerDto.name,
          registerDto.role
        )
      ).rejects.toThrow();
    });
  });
});
