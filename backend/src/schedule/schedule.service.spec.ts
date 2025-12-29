import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleService } from './schedule.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ScheduleService', () => {
  let service: ScheduleService;
  let prisma: PrismaService;

  const mockPrismaService = {
    schedule: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    milestone: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScheduleService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ScheduleService>(ScheduleService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return tasks for a project', async () => {
      const mockTasks = [
        {
          id: '1',
          projectId: '1',
          wbsId: '1',
          taskName: 'Design Phase',
          description: 'Design phase tasks',
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-01-31'),
          duration: 30,
          progress: 50,
          isCritical: false,
          predecessors: [],
          resources: [],
          plannedHours: 240,
          actualHours: 120,
          wbs: { id: '1', name: 'Test WBS', code: '1.0' },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.schedule.findMany.mockResolvedValue(mockTasks);

      const result = await service.findAll('1');

      expect(result).toEqual(mockTasks);
      expect(result).toHaveLength(1);
    });
  });

  describe('create', () => {
    it('should create a new task', async () => {
      const projectId = '1';
      const createDto = {
        taskName: 'Construction Phase',
        description: 'Construction phase tasks',
        startDate: new Date('2025-02-01'),
        endDate: new Date('2025-06-30'),
        duration: 150,
        wbsId: '1',
      };

      const mockCreatedTask = {
        id: '2',
        projectId,
        ...createDto,
        progress: 0,
        isCritical: false,
        predecessors: [],
        resources: [],
        plannedHours: null,
        actualHours: null,
        wbs: { id: '1', name: 'Test WBS', code: '1.0' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.schedule.create.mockResolvedValue(mockCreatedTask);

      const result = await service.create(projectId, createDto);

      expect(result).toBeDefined();
      expect(result.id).toBe('2');
      expect(Number(result.progress)).toBe(0);
    });
  });

  describe('findOne', () => {
    it('should return a single task by id', async () => {
      const mockTask = {
        id: '1',
        projectId: '1',
        wbsId: '1',
        taskName: 'Task A',
        description: 'Task A description',
        duration: 10,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-10'),
        progress: 0,
        isCritical: false,
        predecessors: [],
        resources: [],
        plannedHours: null,
        actualHours: null,
        wbs: { id: '1', name: 'Test WBS', code: '1.0' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.schedule.findUnique.mockResolvedValue(mockTask);

      const result = await service.findOne('1');

      expect(result).toBeDefined();
      expect(result).toEqual(mockTask);
      expect(result.id).toBe('1');
    });
  });

  describe('getMilestones', () => {
    it('should return milestones for a project', async () => {
      const mockMilestones = [
        {
          id: '1',
          projectId: '1',
          name: 'Design Complete',
          description: 'Design phase completed',
          targetDate: new Date('2025-01-31'),
          actualDate: null,
          status: 'PENDING',
          critical: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.milestone.findMany.mockResolvedValue(mockMilestones);

      const result = await service.getMilestones('1');

      expect(result).toEqual(mockMilestones);
      expect(result[0].status).toBe('PENDING');
      expect(result[0].critical).toBe(true);
    });
  });
});
