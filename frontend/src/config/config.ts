import type { AppConfig } from '../types/types';

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

export const config: AppConfig = {
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'mission_control',
    username: process.env.DB_USER || 'klocek',
    password: process.env.DB_PASSWORD || '',
    ssl: isProduction,
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-here',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  cors: {
    origin: isDevelopment
      ? ['http://localhost:3000', 'http://localhost:3001']
      : [process.env.FRONTEND_URL || 'https://your-domain.com'],
    credentials: true,
  },

  uploads: {
    maxSize: parseInt(process.env.MAX_UPLOAD_SIZE || '10485760'), // 10MB
    allowedTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ],
    destination: process.env.UPLOAD_DESTINATION || './uploads',
  },
};

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || (isDevelopment ? 'http://localhost:3000/api' : '/api');

export const WEBSOCKET_URL =
  process.env.NEXT_PUBLIC_WS_URL ||
  (isDevelopment ? 'ws://localhost:3000' : 'wss://your-domain.com');

export const DATABASE_URL =
  process.env.DATABASE_URL ||
  `postgresql://${config.database.username}:${config.database.password}@${config.database.host}:${config.database.port}/${config.database.database}`;

export const APP_NAME = 'Mission Control Platform';
export const APP_VERSION = process.env.npm_package_version || '1.0.0';
export const APP_DESCRIPTION = 'Analog Mission Communication System';

export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 20,
  maxLimit: 100,
};

export const CACHE_SETTINGS = {
  defaultTTL: 300, // 5 minutes
  userCacheTTL: 900, // 15 minutes
  missionCacheTTL: 600, // 10 minutes
  activityCacheTTL: 180, // 3 minutes
};

export const RATE_LIMITING = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // per window
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
};

export const SECURITY_SETTINGS = {
  bcryptRounds: 12,
  sessionSecret: process.env.SESSION_SECRET || 'your-session-secret',
  csrfProtection: isProduction,
  helmetConfig: {
    contentSecurityPolicy: isProduction
      ? {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            fontSrc: ["'self'", 'https://fonts.gstatic.com'],
            imgSrc: ["'self'", 'data:', 'https:'],
            scriptSrc: ["'self'"],
            connectSrc: ["'self'", 'https://api.wheretheiss.at'],
          },
        }
      : false,
  },
};

export const MISSION_SETTINGS = {
  maxCrewMembers: 12,
  maxMissionDuration: 365, // days
  minMissionDuration: 1, // days
  activityTypes: ['exercise', 'meal', 'sleep', 'work', 'eva', 'optional'] as const,
  priorityLevels: ['high', 'medium', 'low'] as const,
  missionStatuses: ['planning', 'active', 'completed', 'cancelled'] as const,
};

export const UI_SETTINGS = {
  theme: {
    defaultMode: 'light' as 'light' | 'dark' | 'system',
    storageKey: 'mission-control-theme',
  },
  notifications: {
    position: 'top-right' as const,
    maxVisible: 5,
    defaultDuration: 5000,
  },
  timeline: {
    minHour: 0,
    maxHour: 24,
    defaultZoom: 1,
    snapToMinutes: 15,
  },
};

export const EXTERNAL_SERVICES = {
  issTracking: {
    apiUrl: 'https://api.wheretheiss.at/v1/satellites/25544',
    refreshInterval: 30000, // 30 seconds
    timeout: 10000, // 10 seconds
  },
  weather: {
    apiUrl: process.env.WEATHER_API_URL,
    apiKey: process.env.WEATHER_API_KEY,
  },
  email: {
    service: process.env.EMAIL_SERVICE || 'gmail',
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || 'noreply@mission-control.space',
  },
};

export const LOGGING = {
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  format: process.env.LOG_FORMAT || 'json',
  file: {
    enabled: isProduction,
    filename: 'logs/app.log',
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  },
  audit: {
    enabled: true,
    retentionDays: 90,
  },
};

export const BACKUP_SETTINGS = {
  enabled: isProduction,
  schedule: '0 2 * * *', // Daily at 2 AM
  retention: 30, // days
  destination: process.env.BACKUP_DESTINATION || './backups',
  compression: true,
};

export const FEATURE_FLAGS = {
  enableWebSocket: process.env.ENABLE_WEBSOCKET !== 'false',
  enableAuditLog: process.env.ENABLE_AUDIT_LOG !== 'false',
  enableNotifications: process.env.ENABLE_NOTIFICATIONS !== 'false',
  enableFileUploads: process.env.ENABLE_FILE_UPLOADS !== 'false',
  enableBackups: process.env.ENABLE_BACKUPS === 'true',
  enableMetrics: process.env.ENABLE_METRICS === 'true',
};

export const validateConfig = (): void => {
  const requiredEnvVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'JWT_SECRET'];

  if (isProduction) {
    const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
  }

  if (config.jwt.secret === 'your-secret-key-here' && isProduction) {
    throw new Error('JWT_SECRET must be set in production');
  }

  if (config.database.password === 'password' && isProduction) {
    throw new Error('DB_PASSWORD must be set in production');
  }
};

export default config;
