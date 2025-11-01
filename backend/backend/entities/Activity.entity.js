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
exports.Activity = exports.Priority = exports.ActivityType = void 0;
const typeorm_1 = require("typeorm");
const Mission_entity_1 = require("./Mission.entity");
const CrewMember_entity_1 = require("./CrewMember.entity");
const User_entity_1 = require("./User.entity");
var ActivityType;
(function (ActivityType) {
    ActivityType["EXERCISE"] = "exercise";
    ActivityType["MEAL"] = "meal";
    ActivityType["SLEEP"] = "sleep";
    ActivityType["WORK"] = "work";
    ActivityType["EVA"] = "eva";
    ActivityType["OPTIONAL"] = "optional";
})(ActivityType || (exports.ActivityType = ActivityType = {}));
var Priority;
(function (Priority) {
    Priority["HIGH"] = "high";
    Priority["MEDIUM"] = "medium";
    Priority["LOW"] = "low";
})(Priority || (exports.Priority = Priority = {}));
let Activity = class Activity {
    // Helper methods
    getEndHour() {
        return this.start_hour + this.duration;
    }
    hasConflict(other) {
        if (this.crew_member_id !== other.crew_member_id)
            return false;
        if (this.date.toString() !== other.date.toString())
            return false;
        const thisEnd = this.getEndHour();
        const otherEnd = other.getEndHour();
        return this.start_hour < otherEnd && thisEnd > other.start_hour;
    }
};
exports.Activity = Activity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Activity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], Activity.prototype, "crew_member_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], Activity.prototype, "mission_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200 }),
    __metadata("design:type", String)
], Activity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Activity.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 4, scale: 2 }),
    __metadata("design:type", Number)
], Activity.prototype, "start_hour", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 4, scale: 2 }),
    __metadata("design:type", Number)
], Activity.prototype, "duration", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ActivityType,
    }),
    __metadata("design:type", String)
], Activity.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: Priority,
        nullable: true,
    }),
    __metadata("design:type", String)
], Activity.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200, nullable: true }),
    __metadata("design:type", String)
], Activity.prototype, "mission", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Activity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], Activity.prototype, "equipment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Activity.prototype, "created_by", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], Activity.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], Activity.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CrewMember_entity_1.CrewMember, (crew) => crew.activities, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'crew_member_id' }),
    __metadata("design:type", CrewMember_entity_1.CrewMember)
], Activity.prototype, "crew_member", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Mission_entity_1.Mission, (mission) => mission.activities, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'mission_id' }),
    __metadata("design:type", Mission_entity_1.Mission)
], Activity.prototype, "mission_ref", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_entity_1.User, { onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'created_by' }),
    __metadata("design:type", User_entity_1.User)
], Activity.prototype, "created_by_user", void 0);
exports.Activity = Activity = __decorate([
    (0, typeorm_1.Entity)('activities')
], Activity);
