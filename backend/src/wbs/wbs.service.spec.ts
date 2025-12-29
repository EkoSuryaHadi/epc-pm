import { Test, TestingModule } from '@nestjs/testing';
import { WbsService } from './wbs.service';
import { PrismaService } from '../prisma/prisma.service';

describe('WbsService', () => {
  let service: WbsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    wBS: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WbsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<WbsService>(WbsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return WBS items for a project', async () => {
      const mockWbsItems = [
        {
          id: '1',
          projectId: '1',
          code: '1.0',
          name: 'Phase 1',
          description: 'Phase 1 description',
          parentId: null,
          level: 1,
          order: 1,
          weightage: 100,
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { costCodes: 0, schedules: 0 },
        },
        {
          id: '2',
          projectId: '1',
          code: '1.1',
          name: 'Task 1.1',
          description: 'Task 1.1 description',
          parentId: '1',
          level: 2,
          order: 1,
          weightage: 50,
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { costCodes: 0, schedules: 0 },
        },
      ];

      mockPrismaService.wBS.findMany.mockResolvedValue(mockWbsItems);

      const result = await service.findAll('1');

      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      expect(mockPrismaService.wBS.findMany).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a new WBS item', async () => {
      const projectId = '1';
      const createDto = {
        code: '2.0',
        name: 'Phase 2',
        description: 'Phase 2 description',
        parentId: null,
        level: 1,
        order: 2,
        weightage: 100,
      };

      const mockCreatedWbs = {
        id: '3',
        projectId,
        ...createDto,
        parent: null,
        children: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.wBS.create.mockResolvedValue(mockCreatedWbs);

      const result = await service.create(projectId, createDto);

      expect(result).toBeDefined();
      expect(result.code).toBe(createDto.code);
      expect(result.id).toBe('3');
    });
  });

  describe('update', () => {
    it('should update WBS item', async () => {
      const mockUpdatedWbs = {
        id: '1',
        projectId: '1',
        code: '1.0',
        name: 'Phase 1 Updated',
        description: 'Updated description',
        parentId: null,
        level: 1,
        order: 1,
        weightage: 100,
        parent: null,
        children: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.wBS.update.mockResolvedValue(mockUpdatedWbs);

      const result = await service.update('1', { name: 'Phase 1 Updated' });

      expect(result.name).toBe('Phase 1 Updated');
      expect(result.weightage).toBe(100);
      expect(mockPrismaService.wBS.update).toHaveBeenCalled();
    });
  });
});
