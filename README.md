# Mission Control - Bachelor Project

A comprehensive mission management and activity tracking system with real-time video communication capabilities. Built with a modern full-stack architecture combining React, TypeScript, Express, and PostgreSQL.

## Project Overview

Mission Control is an intelligent task and mission scheduling system designed for teams requiring real-time coordination, resource allocation, and activity tracking. The system supports user roles (Astronaut, Operator, Admin, Viewer) with granular permission controls, WebRTC-based video communication, and detailed audit logging.

## Architecture

The project is organized into two main sections:

### Frontend

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Real-time Communication**: Socket.io, WebRTC (Simple Peer)
- **UI Components**: Lucide React icons with Framer Motion animations

### Backend

- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT-based auth with refresh tokens
- **Real-time Features**: Socket.io for WebSocket communication
- **Logging**: Winston logger with Morgan HTTP middleware
- **Security**: Helmet, CORS, rate limiting, bcrypt password hashing

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- npm or yarn

### Installation

#### Backend Setup

```bash
cd backend
npm install
npm run migration:run
npm run seed
npm run dev
```

The backend will start on `http://localhost:3000`

#### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:5173`

## Directory Structure

```text
bachelor-project/
├── backend/                 # Express.js API server
│   ├── src/                # TypeScript source
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   ├── entities/       # TypeORM models
│   │   ├── middleware/     # Express middleware (auth, validation, etc.)
│   │   ├── routes/         # API route definitions
│   │   ├── config/         # Database, logger, socket config
│   │   └── utils/          # Helper utilities
│   └── migrations/        # Database migrations
│
└── frontend/              # React SPA
    ├── src/
    │   ├── components/    # Reusable React components
    │   ├── pages/         # Page components
    │   ├── services/      # API client services
    │   ├── hooks/         # Custom React hooks
    │   ├── context/       # React context providers
    │   ├── types/         # TypeScript type definitions
    │   ├── utils/         # Utility functions
    │   ├── api/           # API configuration
    │   └── config/        # App configuration
    └── public/            # Static assets
```

## Key Features

### Authentication & Authorization

- JWT-based authentication with refresh tokens
- Role-based access control (RBAC): Astronaut, Operator, Admin, Viewer
- Viewer accounts with read-only access
- Secure password hashing with bcrypt

### Mission Management

- Create, read, update, delete missions
- Task/activity management with recurring options
- Real-time mission status tracking
- Resource allocation and crew assignment
- PDF attachment support for mission documentation

### Real-time Communication

- WebSocket-based live updates via Socket.io
- WebRTC video conferencing (Simple Peer)
- Real-time activity synchronization
- Live crew member presence tracking

### Activity & Audit Trail

- Detailed activity logging and history
- Comment system on activities
- Audit logging for all operations
- User action tracking

### Additional Features

- Responsive design with Tailwind CSS
- Animated UI with Framer Motion
- File upload support (activities, profile images)
- Error handling and validation middleware
- Production-ready security headers

## Available Scripts

### Backend

```bash
npm run dev           # Start development server with auto-reload
npm run devh          # Start on 0.0.0.0:3000 (network accessible)
npm run build         # Compile TypeScript to JavaScript
npm run start         # Run production build
npm run migration:generate  # Generate database migration
npm run migration:run       # Run pending migrations
npm run seed          # Seed database with initial data
npm run lint          # Lint TypeScript files
npm run format        # Format code with Prettier
```

### Frontend

```bash
npm run dev           # Start development server
npm run devh          # Start on 0.0.0.0:5173 (network accessible)
npm run build         # Build for production
npm run build:analyze # Build with bundle analysis
npm run lint          # Lint code
npm run preview       # Preview production build
npm run format        # Format code with Prettier
```

## Database

PostgreSQL database with TypeORM for ORM functionality.

### Key Entities

- **User**: System users with roles
- **Mission**: Mission definitions
- **Activity**: Individual tasks/activities within missions
- **ActivityComment**: Comments on activities
- **CrewMember**: Team member associations
- **VideoRoom**: Video communication sessions
- **VideoSession**: Individual video session records
- **AuditLog**: Audit trail of system operations
- **RefreshToken**: JWT refresh tokens

### Running Migrations

```bash
npm run migration:run      # Run pending migrations
npm run migration:revert   # Revert last migration
npm run migration:generate # Generate migration from entities
```

## Environment Variables

### Backend (.env)

Create a `.env` file in the backend directory:

```text
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=mission_control
JWT_SECRET=key
JWT_REFRESH_SECRET=secret
NODE_ENV=development
```

### Frontend (.env)

Create a `.env` file in the frontend directory:

``` text
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

## Deployment

### Production Build

Backend:

```bash
npm run build
npm run start
```

Frontend:

```bash
npm run build
npm run preview
```

## 📝 License

MIT

## 👤 Author

kl0cek (Klocek)

---

For detailed documentation on frontend and backend, see [Frontend README](./frontend/README.md) and [Backend README](./backend/README.md).
