# Chowster Modernization Plan
## Aggressive Rewrite Strategy

**Created:** November 2025
**Project:** Chowster - Food Truck Social Media Platform
**Strategy:** Complete rewrite with modern tooling and best practices

---

## Executive Summary

This plan outlines a comprehensive modernization of Chowster, a full-stack JavaScript application built in 2017. The aggressive rewrite approach will leverage modern tooling, TypeScript, and contemporary architectural patterns while maintaining the core features and functionality.

**Timeline:** 3-4 weeks
**Risk Level:** Medium (not production-critical)
**Learning Opportunities:** TypeScript, Vite, Modern React patterns, Apollo v3, Latest GraphQL practices

---

## Security Vulnerabilities Audit

### Current Known Vulnerabilities

#### Server Dependencies
1. **@babel/helpers** - CVE-2025-27789 (Moderate)
   - Severity: CVSS 6.2/10
   - Issue: Inefficient RegExp complexity with named capturing groups
   - Impact: DoS via quadratic complexity in `.replace()` method
   - Fix: Upgrade to @babel/helpers 7.26.10+

#### Client Dependencies
*(Audit service unavailable at time of analysis)*

**Estimated Total Vulnerabilities:** 20-50+ across both client and server based on dependency age (5+ years old)

### High-Risk Legacy Dependencies

**Client:**
- `react@16.12.0` → Latest: 18.3.1 (multiple security patches missed)
- `jquery@3.3.1` → Should be removed entirely (XSS vulnerabilities in older versions)
- `node-sass@4.13.1` → Deprecated, has native binary vulnerabilities
- `@apollo/react-hooks@3.1.3` → Deprecated package
- `apollo-boost@0.4.7` → Deprecated, replaced by @apollo/client
- `moment@2.22.1` → Vulnerable to ReDoS attacks, deprecated (use date-fns/dayjs)

**Server:**
- `express-graphql@0.9.0` → Deprecated (replaced by graphql-http)
- `mongoose@5.9.1` → Multiple prototype pollution vulnerabilities
- `bcryptjs@2.4.3` → Should use bcrypt (native) for better security
- `jsonwebtoken@8.5.1` → Missing security patches from newer versions
- `validator@12.2.0` → Missing 3+ years of security updates

### Security Improvements in Modern Stack
- **Dependency updates** will patch all known CVEs
- **TypeScript** prevents many runtime security issues
- **Modern auth patterns** with httpOnly cookies instead of localStorage
- **Content Security Policy** headers
- **Rate limiting** with modern middleware
- **Input validation** with Zod/Yup schemas

---

## Phase 1: Foundation & Setup (Week 1)

### 1.1 Project Structure Setup

**New Monorepo Architecture:**
```
/Chowster
├── apps/
│   ├── web/              # Vite + React 18 + TypeScript
│   └── api/              # Node.js + Express + TypeScript
├── packages/
│   ├── shared/           # Shared types, utils, constants
│   ├── ui/               # Shared UI components (future-proofing)
│   └── graphql-schema/   # Shared GraphQL schema types
├── package.json          # Workspace root
└── pnpm-workspace.yaml   # pnpm workspaces config
```

**Tools & Package Manager:**
- **pnpm** instead of npm/yarn (faster, better dependency management)
- **Turborepo** for monorepo orchestration (optional but recommended)
- **Prettier + ESLint** with TypeScript support
- **Husky + lint-staged** for pre-commit hooks

### 1.2 TypeScript Configuration

**Strict Mode From Day 1:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

**Shared Types Package:**
- User, Post, Rating types
- GraphQL schema codegen output
- API request/response types
- JWT payload types

### 1.3 Development Environment

**DevContainer Setup:**
- Docker compose with MongoDB, API, and Web
- Hot reload for both frontend and backend
- Consistent environment across machines

**Environment Variables:**
- `.env.example` files with all required vars
- Type-safe env validation using Zod
- No secrets in repo (use `.env.local`)

### Deliverables:
- [ ] Monorepo structure created
- [ ] pnpm workspaces configured
- [ ] TypeScript configs for all packages
- [ ] ESLint + Prettier setup
- [ ] Git hooks configured
- [ ] DevContainer (optional)

---

## Phase 2: Backend Modernization (Week 1-2)

### 2.1 Technology Stack

**Core:**
- **Node.js 22** (LTS with native fetch)
- **TypeScript 5.7+**
- **Express 5.x** (or consider Fastify for performance)
- **GraphQL 16.x**
- **graphql-http** (replaces express-graphql)
- **Mongoose 8.x** with TypeScript support

**Authentication:**
- **jsonwebtoken** (latest) for JWT
- **bcrypt** (native) instead of bcryptjs
- **httpOnly cookies** instead of localStorage for tokens
- **Refresh token rotation** for better security

**Validation & Schema:**
- **Zod** for runtime validation
- **GraphQL Code Generator** for type-safe resolvers
- **@graphql-tools/schema** for schema composition

**Testing:**
- **Vitest** (faster Jest alternative)
- **Supertest** for API testing
- **MSW** for mocking GraphQL in tests

**Other:**
- **Nodemon** → **tsx --watch** for development
- **SendGrid** → Keep or migrate to **Resend** (modern alternative)

### 2.2 Database & Models

**Mongoose Models with TypeScript:**
```typescript
// Before (JS):
const userSchema = new mongoose.Schema({ ... })

// After (TS):
interface IUser extends Document {
  email: string;
  username: string;
  // ... typed fields
}

const userSchema = new Schema<IUser>({ ... })
```

**Schema Improvements:**
- Add indexes for frequently queried fields
- Implement proper cascade deletes
- Add createdAt/updatedAt timestamps
- Consider soft deletes for posts/users

### 2.3 GraphQL Schema Modernization

**Schema-First Approach:**
```graphql
# schema.graphql
type User {
  id: ID!
  username: String!
  email: String!
  # ... properly typed fields
}

type Query {
  me: User!
  user(id: ID!): User
  # ... properly documented queries
}
```

**Type Generation:**
- Use `@graphql-codegen/cli` to generate TypeScript types
- Automatically typed resolvers
- Client-side typed hooks

**Resolver Structure:**
```typescript
// Typed resolver with context
type Context = {
  user?: IUser;
  token?: string;
};

const resolvers: Resolvers<Context> = {
  Query: {
    me: (_, __, { user }) => {
      if (!user) throw new GraphQLError('Not authenticated');
      return user;
    }
  }
}
```

### 2.4 Service Layer Refactoring

**Clean Architecture:**
```
/api/src
├── graphql/
│   ├── schema.graphql      # SDL schema
│   ├── resolvers/          # Typed resolvers
│   └── context.ts          # Context builder
├── services/
│   ├── auth.service.ts     # Business logic
│   ├── user.service.ts
│   └── post.service.ts
├── models/                 # Mongoose models
├── middleware/
│   ├── auth.middleware.ts
│   ├── errorHandler.ts     # Centralized error handling
│   └── rateLimiter.ts      # Rate limiting
├── utils/
│   ├── validation.ts       # Zod schemas
│   └── jwt.ts              # Token utilities
└── types/                  # Shared types
```

### 2.5 Authentication Improvements

**Security Enhancements:**
1. **httpOnly cookies** for JWT storage (prevents XSS)
2. **Refresh token rotation** (long-lived refresh + short-lived access)
3. **CSRF protection** with sameSite cookies
4. **Rate limiting** on auth endpoints
5. **Password strength requirements** with zxcvbn
6. **2FA support** (future enhancement)

**Implementation:**
```typescript
// Set httpOnly cookie instead of returning token
res.cookie('access_token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 15 * 60 * 1000 // 15 minutes
});
```

### 2.6 Testing Strategy

**Unit Tests:**
- Service layer tests (mocked database)
- Model method tests
- Utility function tests

**Integration Tests:**
- GraphQL resolver tests
- Authentication flow tests
- CRUD operation tests

**Test Structure:**
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { mockUser } from '../__mocks__/user.mock';

describe('AuthService', () => {
  it('should create user with hashed password', async () => {
    const user = await authService.signup({...});
    expect(user.password).not.toBe('plaintext');
  });
});
```

### Deliverables:
- [ ] TypeScript backend with Express + GraphQL
- [ ] Mongoose models with TypeScript
- [ ] GraphQL schema with codegen
- [ ] Service layer refactored
- [ ] httpOnly cookie authentication
- [ ] Comprehensive test suite (Vitest)
- [ ] Error handling middleware
- [ ] Rate limiting implemented

---

## Phase 3: Frontend Modernization (Week 2-3)

### 3.1 Technology Stack

**Core:**
- **Vite 6.x** (replaces Create React App)
- **React 18.x** with concurrent features
- **TypeScript 5.7+**
- **React Router v7** (or TanStack Router for type-safety)

**GraphQL:**
- **@apollo/client v3.x** (latest)
- **GraphQL Code Generator** for typed hooks
- **Apollo Client DevTools**

**UI & Styling:**
- **TailwindCSS v4** (replaces Bootstrap + SCSS)
- **shadcn/ui** or **Radix UI** for accessible components
- **Lucide React** for icons (replaces ad-hoc icons)
- **clsx** + **tailwind-merge** for conditional classes

**Forms & Validation:**
- **React Hook Form v7** (performant form handling)
- **Zod** for schema validation (shared with backend)

**Date Handling:**
- **date-fns** (replaces Moment.js - 97% smaller)

**State Management:**
- **Apollo Client** for server state
- **Zustand** for client state (if needed, lightweight)
- **React Context** for auth state

**Build & Dev Tools:**
- **Vite** for blazing fast HMR
- **vite-plugin-pwa** for PWA support (future)
- **@vitejs/plugin-react-swc** for faster builds

### 3.2 Project Structure

```
/apps/web
├── src/
│   ├── app/                    # App shell
│   │   ├── App.tsx
│   │   ├── router.tsx
│   │   └── providers.tsx       # Apollo, Auth, Theme providers
│   ├── pages/                  # Route pages
│   │   ├── HomePage/
│   │   ├── LoginPage/
│   │   ├── UserProfilePage/
│   │   └── [other pages]/
│   ├── components/             # Shared components
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── layout/             # Navbar, Footer, etc.
│   │   ├── post/               # Post-related components
│   │   └── user/               # User-related components
│   ├── features/               # Feature-based modules
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── graphql/
│   │   ├── posts/
│   │   └── users/
│   ├── graphql/
│   │   ├── queries/            # GraphQL queries
│   │   ├── mutations/          # GraphQL mutations
│   │   ├── fragments/          # Reusable fragments
│   │   └── generated/          # Codegen output
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utilities
│   │   ├── apollo.ts
│   │   ├── validation.ts
│   │   └── utils.ts
│   ├── types/                  # TypeScript types
│   └── styles/
│       └── globals.css         # Tailwind imports
├── public/
├── vite.config.ts
├── tailwind.config.ts
├── codegen.ts                  # GraphQL codegen config
└── tsconfig.json
```

### 3.3 GraphQL Code Generation

**Setup:**
```yaml
# codegen.ts
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'http://localhost:3001/api',
  documents: ['src/**/*.{ts,tsx}'],
  generates: {
    './src/graphql/generated/': {
      preset: 'client',
      plugins: [],
      config: {
        useTypeImports: true
      }
    }
  }
};
```

**Usage:**
```typescript
// Before (untyped):
const { data } = useQuery(CURRENT_USER);

// After (fully typed):
import { useCurrentUserQuery } from '@/graphql/generated';
const { data } = useCurrentUserQuery();
// data.me is fully typed!
```

### 3.4 Component Modernization

**Remove jQuery:**
- All DOM manipulation via React refs
- Event handlers via React synthetic events
- No direct DOM queries

**Modern React Patterns:**

**1. Hooks instead of Classes:**
```typescript
// Before: Class components
class PostList extends React.Component { ... }

// After: Functional components with hooks
const PostList: FC = () => {
  const { data, loading } = useGetFeedQuery();
  // ...
}
```

**2. Server State with Apollo:**
```typescript
// Optimistic updates
const [likePost] = useLikePostMutation({
  optimisticResponse: {
    likePost: {
      id: postId,
      likedBy: [...post.likedBy, currentUser.id]
    }
  }
});
```

**3. Custom Hooks for Logic:**
```typescript
// useAuth.ts
export const useAuth = () => {
  const { data } = useCurrentUserQuery();
  const isAuthenticated = !!data?.me;
  const user = data?.me;

  return { isAuthenticated, user };
};
```

**4. Compound Components:**
```typescript
// Post component with sub-components
<Post>
  <Post.Header user={user} timestamp={timestamp} />
  <Post.Content text={text} />
  <Post.Actions onLike={handleLike} onShare={handleShare} />
</Post>
```

### 3.5 Routing & Authentication

**Modern Routing with React Router v7:**
```typescript
// router.tsx
import { createBrowserRouter, redirect } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <LandingPage />
      },
      {
        path: 'home',
        element: <ProtectedRoute><HomePage /></ProtectedRoute>
      }
    ]
  }
]);
```

**Protected Routes with Loaders:**
```typescript
// loader-based protection
const protectedLoader = () => {
  const { isAuthenticated } = getAuthState();
  if (!isAuthenticated) {
    return redirect('/login');
  }
  return null;
};
```

### 3.6 UI Component Library

**shadcn/ui Benefits:**
- Copy-paste components (you own the code)
- Built on Radix UI (accessible)
- Styled with Tailwind
- TypeScript native

**Key Components to Implement:**
- Button, Input, Textarea
- Card, Avatar
- Dialog, Sheet (modals)
- Dropdown Menu
- Toast notifications (replaces custom snackbar)
- Form components

### 3.7 Styling Migration

**Bootstrap → Tailwind:**

**Before (Bootstrap):**
```jsx
<div className="container">
  <div className="row">
    <div className="col-md-6">...</div>
  </div>
</div>
```

**After (Tailwind):**
```jsx
<div className="container mx-auto">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>...</div>
  </div>
</div>
```

**SCSS → CSS-in-JS or Tailwind:**
- Most styles can be Tailwind utilities
- Complex styles: CSS modules or styled-components
- Theme variables in tailwind.config

### 3.8 Performance Optimizations

**Code Splitting:**
```typescript
// Lazy load pages
const UserProfilePage = lazy(() => import('./pages/UserProfilePage'));

<Route path="/user/:id" element={
  <Suspense fallback={<PageLoader />}>
    <UserProfilePage />
  </Suspense>
} />
```

**Image Optimization:**
- Use `<img loading="lazy" />` for below-fold images
- Consider next-gen formats (WebP, AVIF)
- Cloudinary or similar for CDN

**Bundle Analysis:**
- `vite-bundle-visualizer`
- Remove unused dependencies
- Tree-shake libraries

### 3.9 Testing Strategy

**Unit Tests (Vitest):**
```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('LoginForm', () => {
  it('shows validation errors', async () => {
    render(<LoginForm />);
    // ... test interactions
  });
});
```

**Component Tests:**
- React Testing Library
- Mock Apollo with MockedProvider
- Test user interactions

**E2E Tests (Optional - Playwright):**
- Critical user flows
- Login → Create post → Like → Logout

### Deliverables:
- [ ] Vite project setup with TypeScript
- [ ] Apollo Client v3 with codegen
- [ ] All pages migrated to TypeScript
- [ ] Tailwind CSS configured
- [ ] shadcn/ui components installed
- [ ] React Router v7 setup
- [ ] Authentication flow with cookies
- [ ] Forms with React Hook Form + Zod
- [ ] Unit tests for key components
- [ ] Responsive design maintained

---

## Phase 4: Shared Packages & Integration (Week 3-4)

### 4.1 Shared TypeScript Types

**@chowster/shared Package:**
```typescript
// User types
export interface User {
  id: string;
  username: string;
  email: string;
  bio?: string;
  profileImg?: string;
  isAFoodTruck: boolean;
  followers: string[];
  following: string[];
  rating: Rating;
}

// Post types
export interface Post {
  id: string;
  text: string;
  createdAt: Date;
  author: User;
  location?: Location;
  likedBy: string[];
}

// Validation schemas (shared!)
export const signupSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(8),
  isAFoodTruck: z.boolean()
});
```

**Benefits:**
- Single source of truth
- Frontend and backend use same types
- Validation logic shared
- Reduces duplication

### 4.2 Environment & Configuration

**Type-Safe Environment Variables:**
```typescript
// @chowster/shared/config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  PORT: z.string().transform(Number),
  MONGODB_URI: z.string().url(),
  JWT_SECRET: z.string().min(32)
});

export const env = envSchema.parse(process.env);
```

### 4.3 Monorepo Scripts

**Root package.json:**
```json
{
  "scripts": {
    "dev": "pnpm -r --parallel dev",
    "build": "pnpm -r build",
    "test": "pnpm -r test",
    "lint": "pnpm -r lint",
    "type-check": "pnpm -r type-check"
  }
}
```

**Turborepo (optional):**
```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### 4.4 CI/CD Pipeline

**GitHub Actions Workflow:**
```yaml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile
      - run: pnpm type-check
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm build
```

### 4.5 Docker & Deployment

**Multi-stage Dockerfile:**
```dockerfile
# Build stage
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# Production stage
FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/index.js"]
```

**Docker Compose for Development:**
```yaml
services:
  mongodb:
    image: mongo:8
    ports:
      - "27017:27017"

  api:
    build: ./apps/api
    ports:
      - "3001:3001"
    depends_on:
      - mongodb

  web:
    build: ./apps/web
    ports:
      - "5173:5173"
    depends_on:
      - api
```

### Deliverables:
- [ ] Shared types package
- [ ] Shared validation schemas
- [ ] Type-safe env configuration
- [ ] Monorepo scripts configured
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Docker setup for development
- [ ] Production deployment config

---

## Phase 5: Features & Polish (Week 4)

### 5.1 Feature Parity Checklist

**Core Features to Migrate:**
- [x] User authentication (signup, login, logout)
- [x] Email verification
- [x] Create posts (chowts)
- [x] Delete posts
- [x] Like/unlike posts
- [x] Follow/unfollow users
- [x] User profiles
- [x] Edit profile
- [x] Food truck ratings
- [x] User feed (posts from followed users)
- [x] Discovery (random users)
- [x] Search (users and posts)
- [x] Location tagging

### 5.2 New Features to Add

**Enhanced UX:**
- Infinite scroll for feeds (vs. simple limit)
- Real-time notifications (via WebSockets or polling)
- Image uploads (Cloudinary/S3)
- Dark mode toggle
- Progressive Web App (PWA) support

**Technical Improvements:**
- GraphQL subscriptions for real-time updates
- Cursor-based pagination
- DataLoader for N+1 query prevention
- Redis caching layer
- Full-text search with MongoDB Atlas Search

### 5.3 Accessibility

**WCAG 2.1 AA Compliance:**
- Semantic HTML
- ARIA labels where needed
- Keyboard navigation
- Focus management
- Screen reader tested

**Tools:**
- axe DevTools for auditing
- Lighthouse CI in GitHub Actions
- Manual testing with NVDA/VoiceOver

### 5.4 Performance Targets

**Lighthouse Scores:**
- Performance: 90+
- Accessibility: 100
- Best Practices: 100
- SEO: 90+

**Core Web Vitals:**
- LCP < 2.5s
- FID < 100ms
- CLS < 0.1

### 5.5 Documentation

**Developer Documentation:**
- README with setup instructions
- Architecture decision records (ADRs)
- API documentation (GraphQL schema + SDL)
- Component storybook (optional)

**User Documentation:**
- Feature guide
- FAQ
- Privacy policy & terms

### Deliverables:
- [ ] All core features migrated
- [ ] New features implemented
- [ ] Accessibility audit passed
- [ ] Performance targets met
- [ ] Documentation written
- [ ] Final testing completed

---

## Technology Comparison Table

| Category | Old Stack | New Stack | Reason for Change |
|----------|-----------|-----------|-------------------|
| **Frontend Build** | Create React App | Vite | 10x faster HMR, better DX |
| **React Version** | 16.12 | 18.3 | Concurrent features, hooks updates |
| **Styling** | Bootstrap + SCSS | Tailwind + shadcn/ui | Utility-first, smaller bundle |
| **GraphQL Client** | Apollo v2 + apollo-boost | @apollo/client v3 | Modern API, better types |
| **Forms** | Controlled components | React Hook Form + Zod | Performance, validation |
| **Dates** | Moment.js (289KB) | date-fns (3KB) | 97% smaller |
| **Icons** | Mixed sources | Lucide React | Consistent, tree-shakeable |
| **Language** | JavaScript | TypeScript | Type safety, better DX |
| **Backend Server** | Express 4 | Express 5 | Better async support |
| **GraphQL Server** | express-graphql (deprecated) | graphql-http | Modern, maintained |
| **Database** | Mongoose 5 | Mongoose 8 | TypeScript support, bug fixes |
| **Auth Storage** | localStorage | httpOnly cookies | XSS protection |
| **Testing** | Jest | Vitest | Faster, ESM native |
| **Package Manager** | yarn | pnpm | Faster, disk efficient |
| **Node Version** | 8.7+ | 22 LTS | 14 years newer! |

---

## Migration Risks & Mitigation

### Risk 1: Breaking Changes in Dependencies
**Impact:** High
**Likelihood:** High
**Mitigation:**
- Read migration guides for all major deps
- Test incrementally
- Keep old codebase as reference
- Use TypeScript to catch breaking changes

### Risk 2: Authentication Cookie Issues
**Impact:** Medium
**Likelihood:** Medium
**Mitigation:**
- Test across browsers
- Document SameSite policies
- Fallback to token-based if needed
- Support both during migration

### Risk 3: GraphQL Schema Changes
**Impact:** Medium
**Likelihood:** Low
**Mitigation:**
- Keep schema backward compatible
- Use schema stitching/federation if needed
- Version API if breaking changes required

### Risk 4: Lost Features During Migration
**Impact:** High
**Likelihood:** Low
**Mitigation:**
- Comprehensive feature checklist
- Side-by-side comparison testing
- User acceptance testing

### Risk 5: Performance Regression
**Impact:** Medium
**Likelihood:** Low
**Mitigation:**
- Baseline performance metrics before migration
- Continuous monitoring during rewrite
- Lighthouse CI in GitHub Actions

---

## Success Metrics

**Technical Metrics:**
- [ ] 100% TypeScript coverage
- [ ] 80%+ test coverage
- [ ] 0 high/critical security vulnerabilities
- [ ] Lighthouse performance score > 90
- [ ] Build time < 30s
- [ ] All deprecated dependencies removed

**Feature Metrics:**
- [ ] All original features working
- [ ] At least 2 new features added
- [ ] Responsive on mobile/tablet/desktop
- [ ] Accessible (WCAG 2.1 AA)

**Learning Metrics:**
- [ ] TypeScript proficiency gained
- [ ] Modern React patterns learned
- [ ] GraphQL best practices understood
- [ ] DevOps/deployment experience

---

## Post-Modernization Roadmap

**Phase 6 - Enhancements (Optional):**
1. **Real-time Features**
   - WebSocket support for live notifications
   - Optimistic UI for all mutations
   - Live follower count updates

2. **Advanced Features**
   - Direct messaging
   - Push notifications
   - Google Maps integration for truck locations
   - Image/video uploads
   - Story/ephemeral posts

3. **Scale & Performance**
   - Redis caching layer
   - CDN for static assets
   - Database indexing optimization
   - GraphQL query complexity limits
   - Rate limiting per user

4. **Mobile App**
   - React Native app sharing GraphQL queries
   - Expo for faster development
   - Shared types from monorepo

5. **Analytics & Monitoring**
   - Sentry for error tracking
   - PostHog/Mixpanel for analytics
   - Grafana dashboards
   - Uptime monitoring

---

## Quick Start Commands

**1. Initialize New Project:**
```bash
# Create monorepo
mkdir chowster-v2 && cd chowster-v2
pnpm init

# Setup workspaces
mkdir -p apps/web apps/api packages/shared

# Install Vite + React (web)
cd apps/web
pnpm create vite . --template react-swc-ts

# Install TypeScript backend (api)
cd apps/api
pnpm init
pnpm add express graphql graphql-http mongoose
pnpm add -D typescript @types/node @types/express tsx
```

**2. Migration Workflow:**
```bash
# Week 1: Backend
cd apps/api
pnpm add [all dependencies]
# Copy models, convert to TS
# Copy schema, convert to SDL
# Copy services, convert to TS

# Week 2: Frontend
cd apps/web
pnpm add [all dependencies]
# Copy pages, convert to TSX
# Replace Bootstrap with Tailwind
# Setup Apollo v3

# Week 3: Integration
# Share types
# Test full stack
# Fix bugs

# Week 4: Polish
# Add tests
# Fix accessibility
# Optimize performance
```

**3. Development:**
```bash
# Run everything
pnpm dev

# Run specific app
pnpm --filter @chowster/web dev
pnpm --filter @chowster/api dev

# Build
pnpm build

# Test
pnpm test
```

---

## Conclusion

This aggressive modernization plan transforms Chowster from a 2017-era codebase into a modern, type-safe, performant application. The rewrite provides:

1. **Better Developer Experience** - TypeScript, Vite, modern tooling
2. **Improved Security** - Patched vulnerabilities, httpOnly cookies, modern auth
3. **Enhanced Performance** - Faster builds, smaller bundles, optimized rendering
4. **Maintainability** - Clean architecture, comprehensive tests, shared types
5. **Learning Opportunity** - Hands-on with latest web development practices

**Estimated Timeline:** 3-4 weeks at steady pace
**Risk Level:** Medium (mitigated by thorough testing)
**Investment:** Worth it for a portfolio project and learning

Let's build something modern! 🚀
