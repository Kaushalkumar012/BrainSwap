# Testing Guide

Complete guide for testing SkillSwap frontend and backend.

## Testing Overview

SkillSwap uses:
- **Backend**: Jest + Supertest
- **Frontend**: Vitest + React Testing Library
- **Target Coverage**: 70%+

## Backend Testing (Jest)

### Setup

Tests are located in `skillswap-backend/tests/`

```bash
cd skillswap-backend

# Run all tests
npm test

# Watch mode (re-run on changes)
npm run test:watch

# Coverage report
npm run test:coverage

# CI mode (for GitHub Actions)
npm run test:ci
```

### Test Configuration

**jest.config.js** includes:
- Node.js environment
- Auto-mocking of modules
- 10-second timeout per test
- Force exit after tests
- Coverage thresholds: 50%+

### Writing Backend Tests

**Example Test Suite:**
```javascript
// tests/routes/auth.test.js
const request = require('supertest');
const express = require('express');

describe('Auth Routes', () => {
  let app;
  
  beforeAll(() => {
    app = require('../../index');
  });

  describe('POST /api/auth/register', () => {
    test('should register new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123',
          username: 'testuser'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
    });

    test('should reject invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'SecurePass123',
          username: 'testuser'
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    test('should login user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123'
        });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
    });
  });
});
```

### Test Database

Tests use separate database configured in `tests/setup.js`:

```javascript
process.env.DB_NAME = 'skillswap_test';
```

**Run migrations before tests:**
```bash
mysql -u root -p skillswap_test < skillswap-backend/schema.sql
npm test
```

### Coverage Report

After running `npm run test:coverage`, view results:

```bash
open coverage/lcov-report/index.html  # macOS
xdg-open coverage/lcov-report/index.html  # Linux
start coverage/lcov-report/index.html  # Windows
```

## Frontend Testing (Vitest)

### Setup

Tests are located in `skillswap/src/__tests__/`

```bash
cd skillswap

# Run all tests
npm test

# Watch mode
npm run test:watch

# UI Dashboard
npm run test:ui

# Coverage report
npm run test:coverage
```

### Test Configuration

**vitest.config.ts** includes:
- jsdom environment (browser-like)
- React Testing Library integration
- Coverage thresholds: 70%+
- Automatic cleanup after each test

### Writing Frontend Tests

**Example Component Test:**
```typescript
// src/__tests__/components/Button.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it('should handle click events', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    await userEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeDisabled();
  });
});
```

**Example Hook Test:**
```typescript
// src/__tests__/hooks/useAuth.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';

describe('useAuth Hook', () => {
  beforeEach(() => {
    // Clear storage before each test
    localStorage.clear();
  });

  it('should login user', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    expect(result.current.user).toBeDefined();
    expect(result.current.isAuthenticated).toBe(true);
  });
});
```

### Testing Best Practices

1. **Test User Behavior** - Not implementation details
```typescript
// ✅ Good: Test what user sees
expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();

// ❌ Bad: Test internal state
expect(component.state.isLoading).toBe(false);
```

2. **Use Queries in Order of Priority**
```typescript
// 1. getByRole (most semantic)
screen.getByRole('button', { name: /submit/i });

// 2. getByLabelText
screen.getByLabelText('Email');

// 3. getByPlaceholderText
screen.getByPlaceholderText('Enter email');

// 4. getByText
screen.getByText('Submit');

// 5. getByTestId (last resort)
screen.getByTestId('submit-button');
```

3. **Mock External Dependencies**
```typescript
vi.mock('@/services/api', () => ({
  loginUser: vi.fn().mockResolvedValue({ token: 'abc123' })
}));
```

4. **Test Async Operations**
```typescript
it('should load data', async () => {
  const { result } = renderHook(() => useData());

  await waitFor(() => {
    expect(result.current.data).toBeDefined();
  });
});
```

## Coverage Goals

### Backend

Target: 70%+ coverage

Key areas to test:
- Auth routes (100%)
- API routes (80%+)
- Services (70%+)
- Middleware (80%+)
- Utils (70%+)

```bash
# View coverage report
npm run test:coverage
cat coverage/coverage-summary.json
```

### Frontend

Target: 70%+ coverage

Key areas to test:
- Pages (70%+)
- Components (80%+)
- Hooks (85%+)
- Services (70%+)
- Utils (75%+)

```bash
# View coverage report
npm run test:coverage
# Open coverage/index.html
```

## Mocking

### Backend Mocks

```javascript
// Mock database
jest.mock('../db', () => ({
  query: jest.fn(),
  getConnection: jest.fn()
}));

// Mock external API
jest.mock('axios', () => ({
  post: jest.fn().mockResolvedValue({ data: {} })
}));
```

### Frontend Mocks

```typescript
// Mock API service
vi.mock('@/services/api', () => ({
  fetchUsers: vi.fn().mockResolvedValue([]),
  createSkill: vi.fn().mockResolvedValue({ id: 1 })
}));

// Mock router
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({ id: '1' })
}));

// Mock Socket.io
vi.mock('socket.io-client', () => ({
  io: vi.fn().mockReturnValue({
    on: vi.fn(),
    emit: vi.fn(),
    off: vi.fn()
  })
}));
```

## Integration Tests

### API Integration Test

```javascript
// tests/integration/skills.test.js
describe('Skills Integration', () => {
  let token;

  beforeAll(async () => {
    // Register and login user
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'SecurePass123' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'SecurePass123' });

    token = res.body.token;
  });

  test('should create and retrieve skill', async () => {
    const createRes = await request(app)
      .post('/api/skills')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'JavaScript',
        proficiency_level: 'advanced',
        category: 'Programming'
      });

    expect(createRes.status).toBe(201);
    const skillId = createRes.body.skill_id;

    const getRes = await request(app)
      .get(`/api/skills/${skillId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.name).toBe('JavaScript');
  });
});
```

## CI/CD Testing

GitHub Actions automatically runs tests on:
- Every push to main/develop
- Every pull request

View results in GitHub Actions tab.

### Local Simulation

```bash
# Simulate GitHub Actions locally
npm run test:ci  # Backend
npm run test:coverage  # Frontend
```

## Performance Testing

### Backend

```bash
# Load test API
npm install -g autocannon

autocannon http://localhost:8080/api/health -c 10 -d 30
```

### Frontend

```bash
# Lighthouse audit
npm install -g lighthouse

lighthouse http://localhost:5173
```

## Debugging Tests

### Backend

```bash
# Run single test file
npm test -- tests/routes/auth.test.js

# Run specific test
npm test -- -t "should register user"

# Debug in Node
node --inspect-brk node_modules/.bin/jest
```

### Frontend

```bash
# Run single test file
npm test -- src/__tests__/components/Button.test.tsx

# Run specific test
npm test -- -t "should render button"

# UI mode for debugging
npm run test:ui
```

## Test Data Management

### Fixtures

```javascript
// tests/fixtures/user.js
export const mockUser = {
  id: 1,
  email: 'test@example.com',
  username: 'testuser',
  password_hash: 'hashed_password'
};

// Usage in test
import { mockUser } from '../fixtures/user';
```

### Factories

```typescript
// src/__tests__/factories/user.ts
export function createMockUser(overrides = {}) {
  return {
    id: Math.random(),
    email: 'test@example.com',
    ...overrides
  };
}

// Usage
const user = createMockUser({ email: 'custom@example.com' });
```

## Continuous Improvement

1. **Monitor Coverage Trends**
   - Track coverage over time
   - Set targets for each module
   - Regular reviews

2. **Add Tests for Bugs**
   - Write test for bug reproduction
   - Fix bug
   - Verify test passes

3. **Refactor for Testability**
   - Keep components small
   - Extract logic to hooks/services
   - Use dependency injection

4. **Code Review Tests**
   - Review test quality
   - Ensure proper mocking
   - Check edge cases

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Last Updated**: 2026-04-24  
**Version**: 1.0.0
