# Mission Control Backend

Express.js REST API for the Mission Control system. Built with TypeScript, PostgreSQL, and Socket.io for real-time communication. Implements JWT authentication, role-based access control, and comprehensive audit logging.

## Overview

The backend provides:

- RESTful API for mission and activity management
- WebSocket real-time updates via Socket.io
- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Database persistence with TypeORM
- Comprehensive logging and auditing
- File upload management
- Video room management for WebRTC communication

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js 5.x
- **Database**: PostgreSQL 15+ with TypeORM
- **Authentication**: JWT (jsonwebtoken)
- **Real-time**: Socket.io
- **Validation**: express-validator
- **Security**: Helmet, CORS, bcrypt, rate limiting
- **Logging**: Winston + Morgan HTTP middleware
- **File Upload**: Multer
- **Task Scheduling**: Available for background jobs
- **Dev Tools**: Nodemon, ts-node, Jest

## 📁 Project Structure

```text
backend/
├── src/                           # TypeScript source code
│   ├── index.ts                   # Entry point with Express setup
│   ├── server.ts                  # Server initialization
│   ├── controllers/               # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── mission.controller.ts
│   │   ├── activity.controller.ts
│   │   ├── comment.controller.ts
│   │   ├── crew.controller.ts
│   │   ├── videoRoom.controller.ts
│   │   └── ...
│   ├── services/                  # Business logic layer
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── mission.service.ts
│   │   ├── activity.service.ts
│   │   ├── audit.service.ts
│   │   └── ...
│   ├── entities/                  # TypeORM entity models
│   │   ├── User.entity.ts
│   │   ├── Mission.entity.ts
│   │   ├── Activity.entity.ts
│   │   ├── VideoRoom.entity.ts
│   │   └── ...
│   ├── middleware/                # Express middleware
│   │   ├── auth.middleware.ts     # JWT verification
│   │   ├── rbac.middleware.ts     # Role-based access control
│   │   ├── validator.middleware.ts # Input validation
│   │   ├── error.middleware.ts     # Global error handler
│   │   ├── logger.middleware.ts    # Request logging
│   │   └── upload.middleware.ts    # File upload handling
│   ├── routes/                    # Route definitions
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── mission.routes.ts
│   │   ├── activity.routes.ts
│   │   ├── index.ts
│   │   └── ...
│   ├── config/                    # Configuration
│   │   ├── database.ts            # TypeORM database config
│   │   ├── logger.ts              # Winston logger setup
│   │   └── socket.ts              # Socket.io configuration
│   ├── utils/                     # Utility functions
│   │   ├── errors.ts              # Custom error classes
│   │   └── response.ts            # API response helpers
│   ├── migrations/                # Database migrations
│   └── scripts/                   # Utility scripts
│       └── seed.ts                # Database seeding
├── logs/                          # Application logs
├── uploads/                       # Uploaded files
│   └── activities/
├── package.json
├── tsconfig.json
├── nodemon.json
├── schema.sql                     # Database schema reference
└── seed.sql                       # Seed data SQL
```

## Getting Started

### Installation

```bash
npm install
```

### Environment Setup

Create `.env` file in the backend directory:

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=typepassword
DATABASE_NAME=mission_control
DATABASE_SYNCHRONIZE=false
DATABASE_LOGGING=true

# JWT
JWT_SECRET=key
JWT_REFRESH_SECRET=key
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Application
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug

# File Upload
MAX_FILE_SIZE=52428800
UPLOAD_DIR=./uploads

# CORS
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Database Setup

1. Create PostgreSQL database:

```bash
createdb mission_control
```

2. Run migrations:

```bash
npm run migration:run
```

3. Seed database with initial data:

```bash
npm run seed
```

### Development

Start development server with auto-reload:

```bash
npm run dev
```

Server will run on `http://localhost:3000`

For network access:

```bash
npm run devh
```

### Build for Production

```bash
npm run build
```

Compiles TypeScript to JavaScript in the `prod/` directory.

### Run Production Build

```bash
npm run start
```

## 📦 Available Scripts

```bash
npm run dev                 # Start dev server with nodemon and ts-node
npm run devh                # Start dev server on 0.0.0.0:3000
npm run build               # Compile TypeScript to JavaScript
npm run start               # Run production build (node prod/server.js)
npm run migration:generate  # Generate migration from entity changes
npm run migration:run       # Run pending database migrations
npm run migration:run:prod  # Run migrations in production
npm run migration:revert    # Revert the last migration
npm run seed                # Seed database with initial data
npm run lint                # Lint TypeScript files
npm run format              # Format code with Prettier
```

## Authentication & Authorization

### JWT Authentication

- Tokens stored in HTTP-only cookies (secure)
- Refresh token rotation for security
- Access token expires in 15 minutes
- Refresh token expires in 7 days

### Middleware

All protected routes use `auth.middleware.ts`:

```typescript
router.get('/missions', authMiddleware, getMissions);
```

### User Roles

1. **Admin**: Full system access
2. **Operator**: Manage missions and activities
3. **Astronaut**: View assignments, complete activities
4. **Viewer**: Read-only access

### Role-Based Access Control (RBAC)

Applied with `rbac.middleware.ts`:

```typescript
router.post('/admin/users', 
  authMiddleware, 
  rbac(['Admin']), 
  createUser
);
```

## API Endpoints

### Authentication

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user

### Users

- `GET /users` - List all users
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `GET /users/:id/missions` - Get user's missions

### Missions

- `GET /missions` - List missions
- `POST /missions` - Create mission
- `GET /missions/:id` - Get mission details
- `PUT /missions/:id` - Update mission
- `DELETE /missions/:id` - Delete mission
- `GET /missions/:id/activities` - Get mission activities
- `GET /missions/:id/crew` - Get mission crew

### Activities

- `GET /activities` - List activities
- `POST /activities` - Create activity
- `GET /activities/:id` - Get activity details
- `PUT /activities/:id` - Update activity
- `DELETE /activities/:id` - Delete activity
- `PUT /activities/:id/complete` - Mark activity complete
- `GET /activities/:id/comments` - Get activity comments

### Comments

- `POST /comments` - Add comment
- `GET /comments/:id` - Get comment
- `PUT /comments/:id` - Update comment
- `DELETE /comments/:id` - Delete comment

### Crew

- `GET /crew` - List crew members
- `POST /crew` - Add crew member
- `DELETE /crew/:id` - Remove crew member

### Video Rooms

- `POST /video-rooms` - Create video room
- `GET /video-rooms/:id` - Get room details
- `POST /video-rooms/:id/join` - Join room
- `POST /video-rooms/:id/leave` - Leave room

## Database Schema

### Key Entities

#### User

```typescript
- id: UUID (primary key)
- email: string (unique)
- password: hashed string
- firstName: string
- lastName: string
- role: enum (Admin, Operator, Astronaut, Viewer)
- isActive: boolean
- createdAt: timestamp
- updatedAt: timestamp
```

#### Mission

```typescript
- id: UUID
- name: string
- description: text
- status: enum (planning, active, completed, cancelled)
- startDate: timestamp
- endDate: timestamp
- createdBy: FK to User
- createdAt: timestamp
- updatedAt: timestamp
```

#### Activity

```typescript
- id: UUID
- title: string
- description: text
- missionId: FK to Mission
- assignedTo: FK to User
- status: enum (pending, in_progress, completed, cancelled)
- dueDate: timestamp
- completedDate: timestamp
- pdfUrl: string (optional)
- createdAt: timestamp
- updatedAt: timestamp
```

#### VideoRoom

```typescript
- id: UUID
- name: string
- missionId: FK to Mission
- initiatedBy: FK to User
- delay: number
- status: enum (active, inactive)
- createdAt: timestamp
- endedAt: timestamp (optional)
```

### Database Migrations

Migrations are in `src/migrations/`. Generate new ones:
```bash
npm run migration:generate
```

## WebSocket Events (Socket.io)

Real-time event broadcasting:

```typescript
// Activity updates
socket.on('activity:updated', (activity) => {})
socket.on('activity:created', (activity) => {})
socket.on('activity:completed', (activity) => {})

// Mission updates
socket.on('mission:updated', (mission) => {})
socket.on('mission:created', (mission) => {})

// Video room events
socket.on('videoRoom:joined', (user) => {})
socket.on('videoRoom:left', (user) => {})
```

## Security Features

- **Helmet**: Sets secure HTTP headers
- **CORS**: Controlled cross-origin requests
- **Rate Limiting**: Prevent brute force attacks
- **Bcrypt**: Password hashing
- **JWT**: Secure token-based authentication
- **Validation**: Input validation with express-validator
- **SQL Injection Prevention**: TypeORM parameterized queries
- **XSS Protection**: Helmet headers
- **CSRF Protection**: Consider adding for state-changing operations

## Logging

Winston logger configuration in `src/config/logger.ts`:

```typescript
// Log levels: error, warn, info, debug
logger.info('User logged in', { userId: user.id });
logger.error('Database error', { error });
```

Morgan HTTP middleware logs all requests.

Log files stored in `logs/` directory.

## File Upload

Multer middleware configured for file uploads:

```typescript
// Single file upload
router.post('/upload', 
  upload.single('file'), 
  uploadController.upload
);

// Multiple files
router.post('/upload-multiple', 
  upload.array('files', 10), 
  uploadController.uploadMultiple
);
```

Uploaded files stored in `uploads/activities/` directory.

## Configuration

### CORS

Configured in `src/index.ts` to allow frontend at `http://localhost:5173`

### Rate Limiting

Applied globally and to sensitive routes (auth, API).

### Database

TypeORM configuration in `src/config/database.ts` with connection pooling.

## Error Handling

Custom error classes in `src/utils/errors.ts`:

```typescript
class ValidationError extends AppError {}
class NotFoundError extends AppError {}
class UnauthorizedError extends AppError {}
```

Global error middleware catches and formats all errors.

## Audit Logging

All operations logged in `AuditLog` entity:

- User actions
- Resource changes
- Failed authentication attempts
- API errors

```typescript
AuditLog: {
  userId, action, resource, changes, statusCode, timestamp
}
```

## 🔄 Database Synchronization

In development, database synchronization can be enabled in `.env`:

```env
DATABASE_SYNCHRONIZE=true
```

For production, use migrations instead.

## Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong JWT secrets
- [ ] Configure PostgreSQL for production
- [ ] Set up SSL certificates
- [ ] Configure CORS for production domain
- [ ] Set up reverse proxy (nginx)
- [ ] Enable HTTPS
- [ ] Configure environment variables securely
- [ ] Run database migrations
- [ ] Set up logging and monitoring
- [ ] Configure rate limiting appropriately
- [ ] Test all endpoints

## Common Issues

### Database Connection Failed

- Check PostgreSQL is running
- Verify DATABASE_HOST, DATABASE_PORT, credentials in .env
- Ensure database exists: `createdb mission_control`

### Migration Errors

- Check entity definitions
- Run `npm run migration:generate` to create new migration
- Verify migration files in `src/migrations/`

### JWT Errors

- Clear browser cookies
- Verify JWT_SECRET matches frontend expectations
- Check token expiration times

### CORS Issues

- Update CORS_ORIGIN in .env
- Check frontend URL matches CORS configuration

## Additional Resources

- [Express.js Documentation](https://expressjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [TypeScript Documentation](https://www.typescriptlang.org)
- [Socket.io Documentation](https://socket.io/docs)
- [JWT Documentation](https://jwt.io)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)

---

For frontend documentation, see [Frontend README](../frontend/README.md).

For overall project documentation, see [Main README](../README.md).
