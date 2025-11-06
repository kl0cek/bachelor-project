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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mission = exports.MissionStatus = void 0;
const typeorm_1 = require("typeorm");
const User_entity_1 = require("./User.entity");
const CrewMember_entity_1 = require("./CrewMember.entity");
const Activity_entity_1 = require("./Activity.entity");
var MissionStatus;
(function (MissionStatus) {
    MissionStatus["PLANNING"] = "planning";
    MissionStatus["ACTIVE"] = "active";
    MissionStatus["COMPLETED"] = "completed";
    MissionStatus["CANCELLED"] = "cancelled";
})(MissionStatus || (exports.MissionStatus = MissionStatus = {}));
let Mission = class Mission {
    // Helper methods
    getDuration() {
        const start = new Date(this.start_date);
        const end = new Date(this.end_date);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    getMissionDay(date = new Date()) {
        const start = new Date(this.start_date);
        const diffTime = date.getTime() - start.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(1, diffDays);
    }
    isActive(currentDate = new Date()) {
        const start = new Date(this.start_date);
        const end = new Date(this.end_date);
        return (currentDate >= start &&
            currentDate <= end &&
            this.status === MissionStatus.ACTIVE);
    }
};
exports.Mission = Mission;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Mission.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200 }),
    __metadata("design:type", String)
], Mission.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Mission.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Mission.prototype, "start_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Mission.prototype, "end_date", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: MissionStatus,
        default: MissionStatus.PLANNING,
    }),
    __metadata("design:type", String)
], Mission.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Mission.prototype, "created_by", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], Mission.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], Mission.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_entity_1.User, (user) => user.created_missions, {
        onDelete: 'SET NULL',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'created_by' }),
    __metadata("design:type", User_entity_1.User)
], Mission.prototype, "created_by_user", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => CrewMember_entity_1.CrewMember, (crew) => crew.mission),
    __metadata("design:type", Array)
], Mission.prototype, "crew_members", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Activity_entity_1.Activity, (activity) => activity.mission_ref),
    __metadata("design:type", Array)
], Mission.prototype, "activities", void 0);
exports.Mission = Mission = __decorate([
    (0, typeorm_1.Entity)('missions')
], Mission);
