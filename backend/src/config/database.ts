import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { User } from '../entities/User.entity';
import { Mission } from '../entities/Mission.entity';
import { CrewMember } from '../entities/CrewMember.entity';
import { Activity } from '../entities/Activity.entity';
import { RefreshToken } from '../entities/RefreshToken.entity';
import { AuditLog } from '../entities/AuditLog.entity';
import { ActivityHistory } from '../entities/ActivityHistory.entity';
import { ActivityComment } from '../entities/ActivityComment.entity';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

const databaseUrl = process.env.DATABASE_URL;

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: databaseUrl,
  host: databaseUrl ? undefined : process.env.DB_HOST || 'localhost',
  port: databaseUrl ? undefined : parseInt(process.env.DB_PORT || '5432'),
  username: databaseUrl ? undefined : process.env.DB_USER || 'postgres',
  password: databaseUrl ? undefined : process.env.DB_PASSWORD || 'password',
  database: databaseUrl ? undefined : process.env.DB_NAME || 'mission_control',

  ssl: isProduction ? { rejectUnauthorized: false } : false,

  entities: [
    User,
    Mission,
    CrewMember,
    Activity,
    RefreshToken,
    AuditLog,
    ActivityHistory,
    ActivityComment,
  ],

  migrations: [isProduction ? 'prod/migrations/**/*.js' : 'src/migrations/**/*.ts'],

  subscribers: [isProduction ? 'prod/subscribers/**/*.js' : 'src/subscribers/**/*.ts'],

  synchronize: process.env.DB_SYNC === 'true' && !isProduction,

  logging: process.env.DB_LOGGING === 'true' ? ['query', 'error', 'warn'] : false,

  extra: {
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  },

  poolSize: 10,

  //timezone: 'Z',
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established successfully');

    if (process.env.DB_SYNC === 'true' && !isProduction) {
      console.log('Database synchronization is enabled (development only)');
    }
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
};

//export default AppDataSource;
