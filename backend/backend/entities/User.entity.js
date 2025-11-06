"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.UserRole = void 0;
const typeorm_1 = require("typeorm");
const bcrypt_1 = __importDefault(require("bcrypt"));
const Mission_entity_1 = require("./Mission.entity");
const CrewMember_entity_1 = require("./CrewMember.entity");
const RefreshToken_entity_1 = require("./RefreshToken.entity");
const AuditLog_entity_1 = require("./AuditLog.entity");
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "admin";
    UserRole["OPERATOR"] = "operator";
    UserRole["ASTRONAUT"] = "astronaut";
    UserRole["VIEWER"] = "viewer";
})(UserRole || (exports.UserRole = UserRole = {}));
let User = class User {
    // Hash password before insert/update
    async hashPassword() {
        if (this.password) {
            const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
            this.password_hash = await bcrypt_1.default.hash(this.password, rounds);
            delete this.password; // Remove plain password
        }
    }
    // Method to validate password
    async validatePassword(password) {
        return bcrypt_1.default.compare(password, this.password_hash);
    }
    // Method to check permissions
    hasPermission(permission) {
        const permissions = {
            [UserRole.VIEWER]: ['view_schedule', 'view_mission'],
            [UserRole.ASTRONAUT]: [
                'view_schedule',
                'view_mission',
                'update_own_activities',
            ],
            [UserRole.OPERATOR]: [
                'view_schedule',
                'view_mission',
                'create_mission',
                'edit_mission',
                'manage_crew',
                'manage_activities',
            ],
            [UserRole.ADMIN]: ['all'],
        };
        if (this.role === UserRole.ADMIN) {
            return true;
        }
        return permissions[this.role]?.includes(permission) || false;
    }
    // Method to check role
    hasRole(role) {
        return this.role === role || this.role === UserRole.ADMIN;
    }
    // Sanitize user data (remove sensitive fields)
    toJSON() {
        const { password_hash, refresh_tokens, ...user } = this;
        return user;
    }
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, unique: true }),
    __metadata("design:type", String)
], User.prototype, "username", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, select: false }),
    __metadata("design:type", String)
], User.prototype, "password_hash", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: UserRole,
        default: UserRole.VIEWER,
    }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], User.prototype, "full_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, unique: true, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], User.prototype, "is_active", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], User.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], User.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp with time zone', nullable: true }),
    __metadata("design:type", Date)
], User.prototype, "last_login", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Mission_entity_1.Mission, (mission) => mission.created_by_user),
    __metadata("design:type", Array)
], User.prototype, "created_missions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => CrewMember_entity_1.CrewMember, (crew) => crew.user),
    __metadata("design:type", Array)
], User.prototype, "crew_assignments", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => RefreshToken_entity_1.RefreshToken, (token) => token.user),
    __metadata("design:type", Array)
], User.prototype, "refresh_tokens", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => AuditLog_entity_1.AuditLog, (log) => log.user),
    __metadata("design:type", Array)
], User.prototype, "audit_logs", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], User.prototype, "hashPassword", null);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('users')
], User);
