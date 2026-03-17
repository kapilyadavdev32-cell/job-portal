# Job Portal Backend - Complete API Routes Setup

## Project Structure Overview

```
backend/
├── app.js                          # Express app configuration
├── index.js                        # Server entry point
├── package.json
├── controllers/                    # Business logic
│   ├── auth.controllers.js
│   ├── user.controller.js
│   ├── job.controller.js
│   ├── company.controller.js
│   ├── application.controller.js
│   ├── savedJob.controller.js
│   └── admin.controller.js
├── router/                         # Route handlers
│   ├── index.js                   # Centralized router exports
│   ├── auth.router.js
│   ├── user.router.js
│   ├── job.router.js
│   ├── company.router.js
│   ├── application.router.js
│   ├── savedJob.router.js
│   ├── admin.router.js
│   └── healthcheck.router.js
├── middlewares/                    # Custom middleware
│   └── auth.middleware.js         # JWT verification
├── models/                         # Database schemas
│   ├── user.model.js
│   ├── job.model.js
│   ├── company.model.js
│   ├── application.model.js
│   └── savedJob.model.js
├── utils/                          # Utility functions
│   ├── index.js                   # Centralized exports
│   ├── api.error.js               # Error handling
│   ├── api.response.js            # Response formatting
│   ├── async-handler.js           # Async wrapper
│   ├── constants.js
│   └── mail.js                    # Email functionality
└── db/
    └── index.js                   # Database connection
```

## API Routes

### Authentication Routes
```
POST   /api/v1/auth/register              - Register new user
POST   /api/v1/auth/login                 - Login user
POST   /api/v1/auth/logout                - Logout user (JWT required)
POST   /api/v1/auth/refresh-token         - Refresh access token
POST   /api/v1/auth/verify-email/:token   - Verify email
POST   /api/v1/auth/resend-verification   - Resend verification (JWT required)
POST   /api/v1/auth/forgot-password       - Request password reset
POST   /api/v1/auth/reset-password        - Reset password
```

### User Routes (All require JWT)
```
GET    /api/v1/users                      - Get all users (admin only)
GET    /api/v1/users/:id                  - Get user by ID
PUT    /api/v1/users/:id                  - Update user
DELETE /api/v1/users/:id                  - Delete user
```

### Job Routes
```
POST   /api/v1/jobs                       - Create job (JWT required)
GET    /api/v1/jobs                       - Get all jobs with filters
GET    /api/v1/jobs/:id                   - Get job by ID
PUT    /api/v1/jobs/:id                   - Update job (JWT required)
DELETE /api/v1/jobs/:id                   - Delete job (JWT required)
```

### Company Routes
```
POST   /api/v1/companies                  - Create company (JWT required)
GET    /api/v1/companies                  - Get all companies
GET    /api/v1/companies/:id              - Get company by ID
PUT    /api/v1/companies/:id              - Update company (JWT required)
DELETE /api/v1/companies/:id              - Delete company (JWT required)
PUT    /api/v1/companies/:id/verify       - Verify company (JWT required)
```

### Application Routes (All require JWT)
```
POST   /api/v1/applications               - Apply to job
GET    /api/v1/applications               - Get applications
GET    /api/v1/applications/:id           - Get application by ID
PUT    /api/v1/applications/:id           - Update application
DELETE /api/v1/applications/:id           - Delete application
```

### Saved Jobs Routes (All require JWT)
```
POST   /api/v1/saved-jobs                 - Save a job
GET    /api/v1/saved-jobs                 - Get saved jobs
DELETE /api/v1/saved-jobs/:id             - Remove saved job
```

### Admin Routes (All require JWT, admin only)
```
GET    /api/v1/admin/users                - Get all users
GET    /api/v1/admin/companies            - Get all companies
PUT    /api/v1/admin/companies/:id/verify - Verify company
PUT    /api/v1/admin/users/:id/role       - Change user role
```

### Health Check Route
```
GET    /api/v1/healthcheck                - Server health check
```

## Key Files Created

1. **Router Files** (`/router/`)
   - auth.router.js - Authentication routes
   - user.router.js - User management routes
   - job.router.js - Job listing routes
   - company.router.js - Company management routes
   - application.router.js - Job application routes
   - savedJob.router.js - Saved jobs routes
   - admin.router.js - Admin management routes
   - index.js - Centralized router exports

2. **Middleware** (`/middlewares/`)
   - auth.middleware.js - JWT verification middleware

3. **Utils** (`/utils/`)
   - index.js - Centralized utility exports for easy importing

## Updated Files

1. **app.js** - Now imports and uses all routers with proper middleware configuration

## How to Use

### Import Routes in app.js
```javascript
import { 
  authRouter, 
  userRouter, 
  jobRouter, 
  // ... other routers 
} from "./router/index.js";

app.use("/api/v1/auth", authRouter);
// ... other routes
```

### Import Utils
```javascript
// Old way
import { ApiError } from "../utils/api.error.js";
import { ApiResponse } from "../utils/api.response.js";

// New way (using the index.js)
import { ApiError, ApiResponse, asyncHandler } from "../utils/index.js";
```

## Authentication

- JWT tokens are required for protected routes
- Tokens can be passed via:
  - Cookie: `accessToken`
  - Header: `Authorization: Bearer <token>`

## Next Steps

1. Verify all controller functions match the route definitions
2. Check that all missing controller functions are implemented
3. Test all API endpoints
4. Add input validation middleware if needed
5. Add error handling middleware for global error management

