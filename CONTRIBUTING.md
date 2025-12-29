# Contributing to EPC Project Management System

Thank you for your interest in contributing! This document provides guidelines for contributing to this project.

## 🚀 Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/epc-pm.git
   cd epc-pm
   ```
3. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 📋 Development Workflow

### 1. Setup Development Environment

Follow the setup instructions in [SETUP.md](SETUP.md) or [QUICKSTART.md](QUICKSTART.md).

### 2. Make Your Changes

- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Update documentation if needed

### 3. Test Your Changes

```bash
# Run backend tests (if available)
cd backend
npm test

# Run frontend tests (if available)
cd frontend
npm test

# Manual testing
npm run dev
```

### 4. Commit Your Changes

Use clear, descriptive commit messages:

```bash
git add .
git commit -m "feat: add new feature description"
```

#### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

**Examples:**
```
feat: add cost variance report
fix: resolve authentication timeout issue
docs: update API documentation
refactor: optimize database queries
```

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## 🎨 Code Style Guidelines

### TypeScript/JavaScript

- Use **TypeScript** for type safety
- Follow **ESLint** rules
- Use **meaningful variable names**
- Keep functions **small and focused**
- Add **JSDoc comments** for public APIs

**Example:**
```typescript
/**
 * Calculate cost variance for a project
 * @param budgetCost - The budgeted cost
 * @param actualCost - The actual cost incurred
 * @returns Cost variance (negative = over budget)
 */
function calculateCostVariance(budgetCost: number, actualCost: number): number {
  return budgetCost - actualCost;
}
```

### React/Next.js Components

- Use **functional components** with hooks
- Keep components **small and reusable**
- Use **TypeScript interfaces** for props
- Follow **Next.js best practices**

**Example:**
```typescript
interface ProjectCardProps {
  project: Project;
  onSelect: (id: string) => void;
}

export function ProjectCard({ project, onSelect }: ProjectCardProps) {
  return (
    <div onClick={() => onSelect(project.id)}>
      <h3>{project.name}</h3>
    </div>
  );
}
```

### NestJS Backend

- Use **DTOs** for validation
- Implement **proper error handling**
- Use **dependency injection**
- Follow **NestJS module structure**

### Database (Prisma)

- Write **clear migration names**
- Add **indexes** for frequently queried fields
- Use **transactions** for related operations
- Document **schema changes**

## 🧪 Testing Guidelines

### Unit Tests

- Test individual functions/methods
- Mock external dependencies
- Aim for high code coverage

### Integration Tests

- Test API endpoints
- Test database operations
- Test authentication flows

### E2E Tests

- Test critical user flows
- Test from user perspective

## 📝 Documentation

When adding new features:

1. Update **README.md** if needed
2. Add **JSDoc comments** to functions
3. Update **API documentation**
4. Add **examples** where helpful

## 🐛 Bug Reports

When reporting bugs, include:

1. **Description** - Clear description of the issue
2. **Steps to Reproduce** - How to reproduce the bug
3. **Expected Behavior** - What should happen
4. **Actual Behavior** - What actually happens
5. **Environment** - OS, Node version, etc.
6. **Screenshots** - If applicable

## 💡 Feature Requests

When requesting features:

1. **Use Case** - Why is this needed?
2. **Proposed Solution** - How should it work?
3. **Alternatives** - Other approaches considered
4. **Additional Context** - Any other relevant info

## 🔍 Code Review Process

All submissions require review:

1. **Automated checks** must pass
2. **Code review** by maintainers
3. **Testing** verification
4. **Documentation** review

### Review Criteria

- Code quality and style
- Test coverage
- Documentation completeness
- Performance impact
- Security considerations

## 📦 Pull Request Checklist

Before submitting a PR:

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests pass
- [ ] No console errors or warnings
- [ ] Commit messages follow conventions
- [ ] Branch is up to date with main

## 🌳 Branch Strategy

- `main` - Production-ready code
- `develop` - Development branch (if used)
- `feature/*` - New features
- `fix/*` - Bug fixes
- `hotfix/*` - Urgent production fixes

## 📞 Questions?

If you have questions:

1. Check existing documentation
2. Search existing issues
3. Create a new issue with the "question" label

## 🙏 Thank You!

Your contributions make this project better for everyone!

---

**Happy Coding!** 🚀
