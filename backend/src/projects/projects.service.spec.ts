import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    project: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    projectMember: {
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return array of projects', async () => {
      const mockProjects = [
        {
          id: '1',
          name: 'Test Project 1',
          projectCode: 'PROJ001',
          status: 'ACTIVE',
          totalBudget: 1000000,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'Test Project 2',
          projectCode: 'PROJ002',
          status: 'PLANNING',
          totalBudget: 2000000,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.project.findMany.mockResolvedValue(mockProjects);

      const result = await service.findAll();

      expect(result).toEqual(mockProjects);
      expect(result).toHaveLength(2);
      expect(mockPrismaService.project.findMany).toHaveBeenCalled();
    });

    it('should return empty array if no projects', async () => {
      mockPrismaService.project.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should return a project by id', async () => {
      const mockProject = {
        id: '1',
        name: 'Test Project',
        projectCode: 'PROJ001',
        status: 'ACTIVE',
        budget: 1000000,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.project.findUnique.mockResolvedValue(mockProject);

      const result = await service.findOne('1');

      expect(result).toEqual(mockProject);
      expect(mockPrismaService.project.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: expect.any(Object),
      });
    });

    it('should return null if project not found', async () => {
      mockPrismaService.project.findUnique.mockResolvedValue(null);

      const result = await service.findOne('999');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new project', async () => {
      const userId = 'user1';
      const createDto = {
        name: 'New Project',
        projectCode: 'PROJ003',
        description: 'Test description',
        client: 'Test Client',
        contractor: 'Test Contractor',
        startDate: new Date(),
        endDate: new Date(),
        totalBudget: 5000000,
        currency: 'USD',
        status: 'PLANNING',
      };

      const mockCreatedProject = {
        id: '3',
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.project.create.mockResolvedValue(mockCreatedProject);

      const result = await service.create(createDto, userId);

      expect(result).toEqual(mockCreatedProject);
      expect(result.name).toBe(createDto.name);
      expect(mockPrismaService.project.create).toHaveBeenCalled();
    });

    it('should throw error if project code already exists', async () => {
      const userId = 'user1';
      const createDto = {
        name: 'Duplicate Project',
        projectCode: 'PROJ001',
        totalBudget: 1000000,
      };

      mockPrismaService.project.create.mockRejectedValue(
        new Error('Unique constraint failed on the fields: (`projectCode`)')
      );

      await expect(service.create(createDto, userId)).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update a project', async () => {
      const updateDto = {
        name: 'Updated Project Name',
        totalBudget: 1500000,
        status: 'ACTIVE',
      };

      const mockUpdatedProject = {
        id: '1',
        projectCode: 'PROJ001',
        ...updateDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.project.update.mockResolvedValue(mockUpdatedProject);

      const result = await service.update('1', updateDto);

      expect(result).toEqual(mockUpdatedProject);
      expect(result.name).toBe(updateDto.name);
      expect(mockPrismaService.project.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateDto,
        include: expect.any(Object),
      });
    });
  });

  describe('remove', () => {
    it('should delete a project', async () => {
      const mockDeletedProject = {
        id: '1',
        name: 'Deleted Project',
        projectCode: 'PROJ001',
      };

      mockPrismaService.project.delete.mockResolvedValue(mockDeletedProject);

      const result = await service.remove('1');

      expect(result).toEqual(mockDeletedProject);
      expect(mockPrismaService.project.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw error if project not found', async () => {
      mockPrismaService.project.delete.mockRejectedValue(
        new Error('Record to delete does not exist.')
      );

      await expect(service.remove('999')).rejects.toThrow();
    });
  });
});
