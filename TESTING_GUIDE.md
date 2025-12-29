# Testing Guide - EPC Project Control

**Last Updated:** November 3, 2025  
**Testing Framework:** Jest + React Testing Library  
**Coverage Target:** Backend 60%, Frontend 50%

---

## 📊 TESTING OVERVIEW

### **Test Suite Summary**

| Area | Framework | Tests | Coverage Target |
|------|-----------|-------|-----------------|
| Backend | Jest + @nestjs/testing | 32+ tests | 60% |
| Frontend | Jest + React Testing Library | 20+ tests | 50% |
| **Total** | - | **52+ tests** | **55%** |

### **Test Structure**
```
epc/
├── backend/
│   ├── jest.config.js
│   └── src/
│       ├── auth/
│       │   └── auth.service.spec.ts (8 tests)
│       ├── projects/
│       │   └── projects.service.spec.ts (8 tests)
│       ├── cost/
│       │   └── cost.service.spec.ts (6 tests)
│       ├── wbs/
│       │   └── wbs.service.spec.ts (5 tests)
│       └── schedule/
│           └── schedule.service.spec.ts (5 tests)
│
└── frontend/
    ├── jest.config.js
    ├── jest.setup.js
    └── src/
        ├── components/
        │   ├── ui/
        │   │   ├── button.test.tsx (6 tests)
        │   │   └── card.test.tsx (3 tests)
        │   ├── cost/
        │   │   └── KPICard.test.tsx (6 tests)
        │   └── reports/
        │       └── ReportTypeSelector.test.tsx (5 tests)
        └── lib/validations/
            └── report.test.ts (10 tests)
```

---

## 🚀 QUICK START

### **Backend Testing**

```bash
# Navigate to backend
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:cov

# View coverage
# Opens at: backend/coverage/lcov-report/index.html
```

### **Frontend Testing**

```bash
# Navigate to frontend
cd frontend

# Install testing dependencies (if not installed)
npm install

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:cov
```

---

## 📋 BACKEND TESTS

### **1. Auth Service Tests** (8 tests)
**File:** `backend/src/auth/auth.service.spec.ts`

**Tests:**
- ✅ Service initialization
- ✅ Validate user with correct credentials
- ✅ Return null for non-existent user
- ✅ Return null for incorrect password
- ✅ Generate JWT token on login
- ✅ Register new user with hashed password
- ✅ Throw error for duplicate email
- ✅ Exclude password from return data

**Key Mocks:**
- PrismaService (user.findUnique, user.create)
- JwtService (sign)
- bcrypt (hash, compare)

---

### **2. Projects Service Tests** (8 tests)
**File:** `backend/src/projects/projects.service.spec.ts`

**Tests:**
- ✅ Service initialization
- ✅ Find all projects
- ✅ Return empty array when no projects
- ✅ Find project by ID
- ✅ Return null for non-existent project
- ✅ Create new project
- ✅ Throw error for duplicate project code
- ✅ Update project
- ✅ Delete project

**Key Mocks:**
- PrismaService (project CRUD operations)

---

### **3. Cost Service Tests** (6 tests)
**File:** `backend/src/cost/cost.service.spec.ts`

**Tests:**
- ✅ Service initialization
- ✅ Get cost codes for project
- ✅ Create cost code
- ✅ Calculate cost summary with totals
- ✅ Return zero totals for no data
- ✅ Create cost entry

**Key Mocks:**
- PrismaService (costCode, costEntry operations)

---

### **4. WBS Service Tests** (5 tests)
**File:** `backend/src/wbs/wbs.service.spec.ts`

**Tests:**
- ✅ Service initialization
- ✅ Get hierarchical WBS tree
- ✅ Create WBS item
- ✅ Update WBS progress
- ✅ Validate progress boundaries (0-100)

**Key Mocks:**
- PrismaService (wbs operations)

---

### **5. Schedule Service Tests** (5 tests)
**File:** `backend/src/schedule/schedule.service.spec.ts`

**Tests:**
- ✅ Service initialization
- ✅ Get tasks for project
- ✅ Create new task
- ✅ Calculate critical path
- ✅ Get milestones

**Key Mocks:**
- PrismaService (schedule, milestone operations)

---

## 🎨 FRONTEND TESTS

### **1. Button Component Tests** (6 tests)
**File:** `frontend/src/components/ui/button.test.tsx`

**Tests:**
- ✅ Renders button with text
- ✅ Handles click events
- ✅ Can be disabled
- ✅ Renders different variants (default, destructive, outline)
- ✅ Renders different sizes (sm, default, lg)

---

### **2. Card Component Tests** (3 tests)
**File:** `frontend/src/components/ui/card.test.tsx`

**Tests:**
- ✅ Renders card with all sub-components
- ✅ Renders without optional sections
- ✅ Applies custom className

---

### **3. KPICard Component Tests** (6 tests)
**File:** `frontend/src/components/cost/KPICard.test.tsx`

**Tests:**
- ✅ Renders KPI title and value
- ✅ Renders with icon
- ✅ Displays trend
- ✅ Applies positive trend styling
- ✅ Applies negative trend styling
- ✅ Renders description

---

### **4. ReportTypeSelector Tests** (5 tests)
**File:** `frontend/src/components/reports/ReportTypeSelector.test.tsx`

**Tests:**
- ✅ Renders all 5 report types
- ✅ Highlights selected report type
- ✅ Calls onChange on click
- ✅ Displays descriptions
- ✅ Displays icons

---

### **5. Report Validation Tests** (10 tests)
**File:** `frontend/src/lib/validations/report.test.ts`

**Tests:**
- ✅ Validates valid report configuration
- ✅ Rejects invalid project ID
- ✅ Requires minimum title length
- ✅ Validates date range
- ✅ Accepts valid export formats
- ✅ Returns correct sections for PROGRESS report
- ✅ Returns correct sections for COST report
- ✅ Returns correct sections for SCHEDULE report
- ✅ Returns correct sections for RISK report
- ✅ Returns all sections for COMPREHENSIVE report

---

## 🎯 COVERAGE TARGETS

### **Backend Coverage Thresholds**
```javascript
{
  global: {
    branches: 50,
    functions: 50,
    lines: 60,
    statements: 60,
  }
}
```

### **Frontend Coverage Thresholds**
```javascript
{
  global: {
    branches: 40,
    functions: 40,
    lines: 50,
    statements: 50,
  }
}
```

### **Current Coverage (Estimated)**
- Backend: ~55-65% (target: 60%)
- Frontend: ~45-55% (target: 50%)
- **Overall: ~50-60%**

---

## 📝 WRITING NEW TESTS

### **Backend Test Template**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { YourService } from './your.service';
import { PrismaService } from '../prisma/prisma.service';

describe('YourService', () => {
  let service: YourService;
  let prisma: PrismaService;

  const mockPrismaService = {
    model: {
      findMany: jest.fn(),
      create: jest.fn(),
      // ... other methods
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        YourService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<YourService>(YourService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Your tests here
});
```

### **Frontend Test Template**

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { YourComponent } from './YourComponent';

describe('YourComponent', () => {
  it('renders correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles user interactions', async () => {
    const mockOnClick = jest.fn();
    render(<YourComponent onClick={mockOnClick} />);
    
    const button = screen.getByRole('button');
    await userEvent.click(button);
    
    expect(mockOnClick).toHaveBeenCalled();
  });
});
```

---

## 🔧 CONFIGURATION FILES

### **Backend: jest.config.js**
```javascript
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.module.ts',
    '!**/main.ts',
    '!**/*.interface.ts',
    '!**/*.dto.ts',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};
```

### **Frontend: jest.config.js**
```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({ dir: './' });

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
};

module.exports = createJestConfig(customJestConfig);
```

### **Frontend: jest.setup.js**
```javascript
import '@testing-library/jest-dom';

jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      pathname: '/',
    };
  },
}));
```

---

## 🐛 COMMON ISSUES & SOLUTIONS

### **Issue 1: "Cannot find module '@testing-library/react'"**
**Solution:**
```bash
cd frontend
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom
```

### **Issue 2: "TextEncoder is not defined"**
**Solution:** Add to jest.setup.js:
```javascript
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
```

### **Issue 3: "Cannot use import statement outside a module"**
**Solution:** Ensure jest.config.js has correct transform:
```javascript
transform: {
  '^.+\\.(t|j)sx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
}
```

### **Issue 4: Prisma mock not working**
**Solution:** Use proper mock structure:
```typescript
const mockPrismaService = {
  model: {
    method: jest.fn().mockResolvedValue(data),
  },
};
```

---

## 📊 TEST EXECUTION

### **Run Specific Test File**
```bash
# Backend
npm test -- auth.service.spec.ts

# Frontend
npm test -- button.test.tsx
```

### **Run Tests Matching Pattern**
```bash
npm test -- --testPathPattern=service

npm test -- --testNamePattern="should create"
```

### **Update Snapshots**
```bash
npm test -- -u
```

### **Run Tests in CI/CD**
```bash
npm test -- --ci --coverage --maxWorkers=2
```

---

## ✅ TESTING CHECKLIST

### **Before Committing:**
- [ ] All tests pass (`npm test`)
- [ ] Coverage meets thresholds (`npm run test:cov`)
- [ ] No console errors
- [ ] Tests are meaningful (not just for coverage)
- [ ] Mocks are properly cleaned up

### **Writing Tests:**
- [ ] Test name describes what it tests
- [ ] One assertion per test (ideally)
- [ ] Tests are independent
- [ ] Tests are repeatable
- [ ] Edge cases covered

### **Code Review:**
- [ ] Test coverage for new features
- [ ] Critical paths tested
- [ ] Error handling tested
- [ ] Integration points tested

---

## 🎓 BEST PRACTICES

### **1. Test Naming**
✅ **Good:**
```typescript
it('should return user without password if credentials are valid', () => {})
it('throws error when email already exists', () => {})
```

❌ **Bad:**
```typescript
it('test 1', () => {})
it('works', () => {})
```

### **2. Arrange-Act-Assert Pattern**
```typescript
it('should create new project', async () => {
  // Arrange
  const createDto = { name: 'Test', code: 'TST' };
  mockService.create.mockResolvedValue({ id: 1, ...createDto });
  
  // Act
  const result = await service.create(createDto);
  
  // Assert
  expect(result.id).toBe(1);
  expect(result.name).toBe('Test');
});
```

### **3. Mock External Dependencies**
```typescript
// ✅ Good - Mock external services
jest.mock('@/lib/api', () => ({
  api: {
    getProjects: jest.fn(),
  },
}));

// ❌ Bad - Don't test external APIs directly
```

### **4. Clean Up After Tests**
```typescript
afterEach(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  jest.restoreAllMocks();
});
```

---

## 📈 NEXT STEPS

### **To Expand Test Coverage:**

1. **Add Integration Tests**
   - Test full request/response cycles
   - Test database operations
   - Test authentication flows

2. **Add E2E Tests**
   - Use Playwright or Cypress
   - Test complete user flows
   - Test cross-browser compatibility

3. **Add Performance Tests**
   - Load testing
   - Stress testing
   - Response time testing

4. **Add Security Tests**
   - SQL injection tests
   - XSS tests
   - Authentication bypass tests

---

## 📞 SUPPORT

**Run Tests:**
```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

**View Coverage:**
```bash
# Backend
npm run test:cov
# Opens: backend/coverage/lcov-report/index.html

# Frontend
npm run test:cov
# Opens: frontend/coverage/lcov-report/index.html
```

---

**Status:** ✅ **Testing Setup Complete**  
**Backend Tests:** 32+  
**Frontend Tests:** 20+  
**Total Tests:** 52+  
**Coverage:** ~50-60%

🎉 **Ready for Continuous Testing!**
