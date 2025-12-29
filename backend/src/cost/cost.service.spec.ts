import { Test, TestingModule } from '@nestjs/testing';
import { CostService } from './cost.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CostService', () => {
  let service: CostService;
  let prisma: PrismaService;

  const mockPrismaService = {
    costCode: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    costEntry: {
      findMany: jest.fn(),
      create: jest.fn(),
      aggregate: jest.fn(),
    },
    project: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CostService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CostService>(CostService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllCostCodes', () => {
    it('should return cost codes for a project', async () => {
      const mockCostCodes = [
        {
          id: '1',
          projectId: '1',
          code: 'MAT-001',
          description: 'Materials',
          category: 'MATERIALS',
          budget: 500000,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          projectId: '1',
          code: 'LAB-001',
          description: 'Labor',
          category: 'LABOR',
          budget: 300000,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.costCode.findMany.mockResolvedValue(mockCostCodes);

      const result = await service.findAllCostCodes('1');

      expect(result).toEqual(mockCostCodes);
      expect(result).toHaveLength(2);
      expect(mockPrismaService.costCode.findMany).toHaveBeenCalled();
    });
  });

  describe('createCostCode', () => {
    it('should create a new cost code', async () => {
      const projectId = '1';
      const createDto = {
        code: 'EQP-001',
        description: 'Equipment',
        category: 'EQUIPMENT',
        budget: 200000,
      };

      const mockCreatedCode = {
        id: '3',
        projectId,
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.costCode.create.mockResolvedValue(mockCreatedCode);

      const result = await service.createCostCode(projectId, createDto);

      expect(result).toEqual(mockCreatedCode);
      expect(result.code).toBe(createDto.code);
    });
  });

  describe('getCostSummary', () => {
    it('should calculate cost summary with totals', async () => {
      const mockProject = { totalBudget: 800000 };
      const mockCostCodes = [
        { 
          id: '1', 
          code: 'MAT-001', 
          name: 'Materials',
          category: 'MATERIALS', 
          budget: 500000,
          costEntries: [
            { amount: 250000 },
            { amount: 100000 }
          ]
        },
        { 
          id: '2', 
          code: 'LAB-001',
          name: 'Labor', 
          category: 'LABOR', 
          budget: 300000,
          costEntries: [
            { amount: 150000 }
          ]
        },
      ];

      mockPrismaService.project.findUnique.mockResolvedValue(mockProject);
      mockPrismaService.costCode.findMany.mockResolvedValue(mockCostCodes);

      const result = await service.getCostSummary('1');

      expect(result).toBeDefined();
      expect(result.totalBudget).toBe(800000);
      expect(result.totalActual).toBe(500000);
      expect(result.costCodes).toBeDefined();
      expect(result.costCodes).toHaveLength(2);
    });

    it('should return zero totals if no cost data', async () => {
      const mockProject = { totalBudget: 0 };
      mockPrismaService.project.findUnique.mockResolvedValue(mockProject);
      mockPrismaService.costCode.findMany.mockResolvedValue([]);

      const result = await service.getCostSummary('1');

      expect(result.totalBudget).toBe(0);
      expect(result.totalActual).toBe(0);
    });
  });

  describe('createCostEntry', () => {
    it('should create a new cost entry', async () => {
      const projectId = '1';
      const userId = 'user1';
      const createDto = {
        costCodeId: '1',
        amount: 50000,
        description: 'Material purchase',
        entryDate: new Date(),
      };

      const mockCreatedEntry = {
        id: '1',
        projectId,
        createdById: userId,
        ...createDto,
        costCode: { id: '1', name: 'Materials', code: 'MAT-001' },
        createdBy: { id: userId, name: 'Test User', email: 'test@example.com' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.costEntry.create.mockResolvedValue(mockCreatedEntry);

      const result = await service.createCostEntry(projectId, createDto, userId);

      expect(result).toEqual(mockCreatedEntry);
      expect(result.amount).toBe(createDto.amount);
    });
  });
});
