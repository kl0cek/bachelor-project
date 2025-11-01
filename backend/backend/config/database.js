"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const dotenv_1 = __importDefault(require("dotenv"));
const User_entity_1 = require("../entities/User.entity");
const Mission_entity_1 = require("../entities/Mission.entity");
const CrewMember_entity_1 = require("../entities/CrewMember.entity");
const Activity_entity_1 = require("../entities/Activity.entity");
const RefreshToken_entity_1 = require("../entities/RefreshToken.entity");
const AuditLog_entity_1 = require("../entities/AuditLog.entity");
const ActivityHistory_entity_1 = require("../entities/ActivityHistory.entity");
dotenv_1.default.config();
const isProduction = process.env.NODE_ENV === 'production';
const databaseUrl = process.env.DATABASE_URL;
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    url: databaseUrl,
    host: databaseUrl ? undefined : process.env.DB_HOST || 'localhost',
    port: databaseUrl ? undefined : parseInt(process.env.DB_PORT || '5432'),
    username: databaseUrl ? undefined : process.env.DB_USER || 'postgres',
    password: databaseUrl ? undefined : process.env.DB_PASSWORD || 'password',
    database: databaseUrl ? undefined : process.env.DB_NAME || 'mission_control',
    ssl: isProduction
        ? { rejectUnauthorized: false }
        : false,
    entities: [
        User_entity_1.User,
        Mission_entity_1.Mission,
        CrewMember_entity_1.CrewMember,
        Activity_entity_1.Activity,
        RefreshToken_entity_1.RefreshToken,
        AuditLog_entity_1.AuditLog,
        ActivityHistory_entity_1.ActivityHistory,
    ],
    migrations: ['src/migrations/**/*.ts'],
    subscribers: ['src/subscribers/**/*.ts'],
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
const initializeDatabase = async () => {
    try {
        await exports.AppDataSource.initialize();
        console.log('Database connection established successfully');
        if (process.env.DB_SYNC === 'true' && !isProduction) {
            console.log('Database synchronization is enabled (development only)');
        }
    }
    catch (error) {
        console.error('Database connection failed:', error);
        throw error;
    }
};
exports.initializeDatabase = initializeDatabase;
exports.default = exports.AppDataSource;
