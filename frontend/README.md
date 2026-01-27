# Mission Control Frontend

React-based SPA for the Mission Control system. Built with TypeScript, Vite, and Tailwind CSS for a modern, responsive user interface with real-time updates and video communication features.

## Overview

The frontend provides an intuitive interface for managing missions, activities, and real-time team coordination. Supports multiple user roles (Astronaut, Operator, Admin, Viewer) with role-based UI and permission controls.

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite (modern, fast bundler)
- **Styling**: Tailwind CSS 4 with PostCSS
- **HTTP Client**: Axios
- **Real-time Communication**: Socket.io-client, Simple Peer (WebRTC)
- **Routing**: React Router v7
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **PDF Support**: react-pdf
- **Linting**: ESLint with TypeScript support
- **Formatting**: Prettier

## Project Structure

```text
src/
├── App.tsx                 # Root component
├── main.tsx               # Entry point
├── index.css              # Global styles
├── Router.tsx             # Route definitions
├── api/                   # API configuration and endpoints
├── components/            # Reusable UI components
│   ├── common/           # Generic components
│   ├── mission/          # Mission-related components
│   ├── activity/         # Activity-related components
│   ├── video/            # Video communication components
│   └── ...
├── pages/                 # Full page components
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── MissionPage.tsx
│   ├── ActivityPage.tsx
│   └── ...
├── services/              # API client services
├── hooks/                 # Custom React hooks
├── context/               # React Context providers
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
├── constants/             # App constants
├── config/                # Configuration files
├── layout/                # Layout components
└── mock/                  # Mock data for development
```

## Getting Started

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The app will open at `http://localhost:5173`

For network access (e.g., from other machines):

```bash
npm run devh
```

This starts on `http://0.0.0.0:5173` and is accessible from `http://<your-machine-ip>:5173`

### Build for Production

```bash
npm run build
```

Outputs optimized files to the `dist/` directory.

Analyze bundle size:

```bash
npm run build:analyze
```

### Preview Production Build

```bash
npm run preview
```

## Available Scripts

```bash
npm run start          # Start dev server (alias for dev)
npm run dev            # Start dev server on localhost:5173
npm run devh           # Start dev server on 0.0.0.0:5173 (network accessible)
npm run build          # TypeScript check + Vite build
npm run build:analyze  # Build with bundle visualization
npm run lint           # ESLint check
npm run preview        # Preview production build locally
npm run format         # Format code with Prettier
```

## Authentication

The frontend implements JWT-based authentication:

- **Login**: Credentials sent to backend, JWT stored in localStorage
- **Refresh**: Automatic token refresh on expiration
- **Logout**: Clear stored tokens and redirect to login

### User Roles

1. **Admin**: Full system access, manage users and settings
2. **Operator**: Manage missions and assign tasks
3. **Astronaut**: View assignments, complete activities, add comments
4. **Viewer**: Read-only access to missions and activities

## Key Features

### Mission Management

- View all missions with filtering and sorting
- Create/edit missions with detailed information
- Assign crew members to missions
- Track mission status in real-time
- View mission history and audit logs

### Activity Management

- View activities with status tracking
- Create/edit activities with descriptions
- Attach PDF files to activities
- Add comments and notes
- Mark activities as complete
- Track activity history

### Real-time Updates

- WebSocket connections for live data
- Real-time activity status changes
- Live crew member presence
- Instant notifications

### Video Communication

- WebRTC-based video rooms
- Real-time video sessions
- Share video room with team members
- Low-latency communication

### User Interface

- Responsive design for desktop and tablet
- Smooth animations with Framer Motion
- Intuitive navigation
- Dark/Light mode support (if implemented)
- Accessible components

## Environment Configuration

Create `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

These are used for:

- `VITE_API_URL`: Backend API endpoint for HTTP requests
- `VITE_SOCKET_URL`: Backend endpoint for WebSocket connections

## Styling

### Tailwind CSS

Global styles and Tailwind configuration in `tailwind.config.js`. Components use Tailwind utility classes for styling.

### PostCSS

Configured in `postcss.config.js` with autoprefixer support.

## Code Quality

### ESLint

Configuration in `eslint.config.js`. Run lint with:

```bash
npm run lint
```

### Prettier

Automatic code formatting with:

```bash
npm run format
```

## API Integration

All API calls go through the services layer (in `src/services/`). Example structure:

```typescript
// src/services/missionService.ts
export const fetchMissions = () => axios.get('/missions');
export const createMission = (data) => axios.post('/missions', data);
```

### Axios Configuration

Configured in `src/api/` with automatic token injection and error handling.

## Components Architecture

Components are organized by feature:

- **Smart Components**: Handle data fetching and state
- **Presentational Components**: Receive props, render UI
- **Hooks**: Extract reusable logic

## Custom Hooks

Implement custom hooks in `src/hooks/` for:

- API data fetching
- Form handling
- Authentication
- WebSocket subscriptions

## Error Handling

- Global error boundary for React errors
- Axios interceptors for API errors
- User-friendly error messages
- Error logging

## Build Output

Production build includes:

- Minified JavaScript and CSS
- Optimized images
- Source maps (in dev mode)
- Gzip compression ready

## Update Process

After backend updates:

1. Update API service types if endpoints change
2. Update service calls if response format changes
3. Rebuild and test

## Additional Resources

- [Vite Documentation](https://vitejs.dev)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Socket.io Client Documentation](https://socket.io/docs/v4/client-api/)

## Debugging

### React DevTools

Install React DevTools browser extension for component inspection.

### Vite DevTools

Run with `npm run dev` for HMR (Hot Module Replacement) during development.

### Console Logging

Use browser DevTools console for debugging (F12 or Cmd+Option+J on Mac).

## Known Limitations / TODO

See [TODO.md](./TODO.md) for features in progress and known issues.

---

For backend documentation, see [Backend README](../backend/README.md).

For overall project documentation, see [Main README](../README.md).

```text
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
