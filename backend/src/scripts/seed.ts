// src/scripts/seed.ts
import 'reflect-metadata';
import dotenv from 'dotenv';
import { AppDataSource } from '../config/database';
import { User, UserRole } from '../entities/User.entity';
import { Mission, MissionStatus } from '../entities/Mission.entity';
import { CrewMember } from '../entities/CrewMember.entity';
import { Activity, ActivityType, Priority } from '../entities/Activity.entity';

dotenv.config();

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('✅ Database connection established');

    // Clear existing data (optional - comment out in production)
    console.log('🗑️  Clearing existing data...');
    await AppDataSource.query('TRUNCATE TABLE activities CASCADE');
    await AppDataSource.query('TRUNCATE TABLE crew_members CASCADE');
    await AppDataSource.query('TRUNCATE TABLE missions CASCADE');
    await AppDataSource.query('TRUNCATE TABLE refresh_tokens CASCADE');
    await AppDataSource.query('TRUNCATE TABLE audit_logs CASCADE');
    await AppDataSource.query('TRUNCATE TABLE activity_history CASCADE');
    await AppDataSource.query('TRUNCATE TABLE users CASCADE');

    // Create repositories
    const userRepo = AppDataSource.getRepository(User);
    const missionRepo = AppDataSource.getRepository(Mission);
    const crewRepo = AppDataSource.getRepository(CrewMember);
    const activityRepo = AppDataSource.getRepository(Activity);

    // 1. Create Users
    console.log('👤 Creating users...');

    const adminUser = userRepo.create({
      username: 'admin',
      password: 'admin123',
      full_name: 'System Administrator',
      email: 'admin@mission-control.space',
      role: UserRole.ADMIN,
      is_active: true,
    });

    const operatorUser = userRepo.create({
      username: 'operator1',
      password: 'operator123',
      full_name: 'Mission Operator',
      email: 'operator@mission-control.space',
      role: UserRole.OPERATOR,
      is_active: true,
    });

    const astronautUser = userRepo.create({
      username: 'astronaut1',
      password: 'astronaut123',
      full_name: 'John Astronaut',
      email: 'astronaut@mission-control.space',
      role: UserRole.ASTRONAUT,
      is_active: true,
    });

    const viewerUser = userRepo.create({
      username: 'viewer1',
      password: 'viewer123',
      full_name: 'Mission Viewer',
      email: 'viewer@mission-control.space',
      role: UserRole.VIEWER,
      is_active: true,
    });

    await userRepo.save([adminUser, operatorUser, astronautUser, viewerUser]);
    console.log('✅ Created 4 users');

    // 2. Create Missions
    console.log('🚀 Creating missions...');

    const activeMission = missionRepo.create({
      name: 'ISS Expedition 71',
      description:
        'Long-duration spaceflight mission to the International Space Station focusing on scientific research and station maintenance.',
      start_date: new Date('2025-10-15'),
      end_date: new Date('2025-11-07'),
      status: MissionStatus.ACTIVE,
      created_by: operatorUser.id,
    });

    const planningMission = missionRepo.create({
      name: 'Mars Analog Simulation',
      description:
        'Ground-based analog mission simulating Mars surface operations for psychological and operational research.',
      start_date: new Date('2024-11-01'),
      end_date: new Date('2025-02-01'),
      status: MissionStatus.PLANNING,
      created_by: operatorUser.id,
    });

    const completedMission = missionRepo.create({
      name: 'Lunar Gateway Simulation',
      description:
        'Simulation of lunar orbital operations and surface missions for Artemis program preparation.',
      start_date: new Date('2024-08-01'),
      end_date: new Date('2024-09-30'),
      status: MissionStatus.COMPLETED,
      created_by: operatorUser.id,
    });

    await missionRepo.save([activeMission, planningMission, completedMission]);
    console.log('✅ Created 3 missions');

    // 3. Create Crew Members for Active Mission
    console.log('👨‍🚀 Creating crew members...');

    const fe1 = crewRepo.create({
      mission_id: activeMission.id,
      user_id: astronautUser.id,
      name: 'FE-1',
      role: 'Flight Engineer',
      email: 'fe1@mission-control.space',
    });

    const fe2 = crewRepo.create({
      mission_id: activeMission.id,
      name: 'FE-2',
      role: 'Flight Engineer',
      email: 'fe2@mission-control.space',
    });

    const fe4 = crewRepo.create({
      mission_id: activeMission.id,
      name: 'FE-4',
      role: 'Flight Engineer',
      email: 'fe4@mission-control.space',
    });

    const fe5 = crewRepo.create({
      mission_id: activeMission.id,
      name: 'FE-5',
      role: 'Flight Engineer',
      email: 'fe5@mission-control.space',
    });

    await crewRepo.save([fe1, fe2, fe4, fe5]);
    console.log('✅ Created 4 crew members');

    // 4. Create Activities for Day 1 (2025-10-15)
    console.log('📅 Creating activities for Day 1...');

    const day1Activities: Partial<Activity>[] = [
      // FE-1 Schedule
      {
        crew_member_id: fe1.id,
        mission_id: activeMission.id,
        name: 'Sleep',
        date: new Date('2025-10-15'),
        start_hour: 0,
        duration: 6,
        type: ActivityType.SLEEP,
        priority: Priority.HIGH,
        mission: 'Daily Operations',
        description: 'Night sleep period',
        created_by: operatorUser.id,
      },
      {
        crew_member_id: fe1.id,
        mission_id: activeMission.id,
        name: 'Post-sleep',
        date: new Date('2025-10-15'),
        start_hour: 7,
        duration: 1,
        type: ActivityType.SLEEP,
        priority: Priority.MEDIUM,
        mission: 'Daily Operations',
        description: 'Morning routine and preparation',
        created_by: operatorUser.id,
      },
      {
        crew_member_id: fe1.id,
        mission_id: activeMission.id,
        name: 'Exercise',
        date: new Date('2025-10-15'),
        start_hour: 11,
        duration: 1.5,
        type: ActivityType.EXERCISE,
        priority: Priority.HIGH,
        mission: 'Health & Fitness',
        description: 'Cardiovascular training',
        created_by: operatorUser.id,
      },
      {
        crew_member_id: fe1.id,
        mission_id: activeMission.id,
        name: 'Lunch',
        date: new Date('2025-10-15'),
        start_hour: 12.5,
        duration: 0.5,
        type: ActivityType.MEAL,
        priority: Priority.MEDIUM,
        mission: 'Nutrition Program',
        description: 'Midday meal',
        created_by: operatorUser.id,
      },
      {
        crew_member_id: fe1.id,
        mission_id: activeMission.id,
        name: 'Science Work',
        date: new Date('2025-10-15'),
        start_hour: 14,
        duration: 3,
        type: ActivityType.WORK,
        priority: Priority.HIGH,
        mission: 'Research Operations',
        description: 'Biology experiments',
        created_by: operatorUser.id,
      },
      {
        crew_member_id: fe1.id,
        mission_id: activeMission.id,
        name: 'Dinner',
        date: new Date('2025-10-15'),
        start_hour: 18,
        duration: 1,
        type: ActivityType.MEAL,
        priority: Priority.MEDIUM,
        mission: 'Nutrition Program',
        description: 'Evening meal with crew',
        created_by: operatorUser.id,
      },
      {
        crew_member_id: fe1.id,
        mission_id: activeMission.id,
        name: 'Pre-sleep',
        date: new Date('2025-10-15'),
        start_hour: 22,
        duration: 2,
        type: ActivityType.SLEEP,
        priority: Priority.MEDIUM,
        mission: 'Daily Operations',
        description: 'Wind down and sleep prep',
        created_by: operatorUser.id,
      },

      // FE-2 Schedule
      {
        crew_member_id: fe2.id,
        mission_id: activeMission.id,
        name: 'Sleep',
        date: new Date('2025-10-15'),
        start_hour: 0,
        duration: 6,
        type: ActivityType.SLEEP,
        priority: Priority.HIGH,
        mission: 'Daily Operations',
        description: 'Night sleep period',
        created_by: operatorUser.id,
      },
      {
        crew_member_id: fe2.id,
        mission_id: activeMission.id,
        name: 'Post-sleep',
        date: new Date('2025-10-15'),
        start_hour: 6,
        duration: 1,
        type: ActivityType.SLEEP,
        priority: Priority.MEDIUM,
        mission: 'Daily Operations',
        description: 'Morning routine',
        created_by: operatorUser.id,
      },
      {
        crew_member_id: fe2.id,
        mission_id: activeMission.id,
        name: 'Station Maintenance',
        date: new Date('2025-10-15'),
        start_hour: 8,
        duration: 4,
        type: ActivityType.WORK,
        priority: Priority.HIGH,
        mission: 'ISS Maintenance',
        description: 'Life support system check',
        created_by: operatorUser.id,
      },
      {
        crew_member_id: fe2.id,
        mission_id: activeMission.id,
        name: 'Lunch',
        date: new Date('2025-10-15'),
        start_hour: 12.5,
        duration: 0.5,
        type: ActivityType.MEAL,
        priority: Priority.MEDIUM,
        mission: 'Nutrition Program',
        description: 'Midday meal',
        created_by: operatorUser.id,
      },
      {
        crew_member_id: fe2.id,
        mission_id: activeMission.id,
        name: 'Exercise',
        date: new Date('2025-10-15'),
        start_hour: 15,
        duration: 1.5,
        type: ActivityType.EXERCISE,
        priority: Priority.HIGH,
        mission: 'Health & Fitness',
        description: 'Resistance training',
        created_by: operatorUser.id,
      },
      {
        crew_member_id: fe2.id,
        mission_id: activeMission.id,
        name: 'Pre-sleep',
        date: new Date('2025-10-15'),
        start_hour: 22,
        duration: 2,
        type: ActivityType.SLEEP,
        priority: Priority.MEDIUM,
        mission: 'Daily Operations',
        description: 'Evening routine',
        created_by: operatorUser.id,
      },

      // FE-4 Schedule
      {
        crew_member_id: fe4.id,
        mission_id: activeMission.id,
        name: 'Sleep',
        date: new Date('2025-10-15'),
        start_hour: 0,
        duration: 6,
        type: ActivityType.SLEEP,
        priority: Priority.HIGH,
        mission: 'Daily Operations',
        description: 'Night sleep period',
        created_by: operatorUser.id,
      },
      {
        crew_member_id: fe4.id,
        mission_id: activeMission.id,
        name: 'Post-sleep',
        date: new Date('2025-10-15'),
        start_hour: 6,
        duration: 1,
        type: ActivityType.SLEEP,
        priority: Priority.MEDIUM,
        mission: 'Daily Operations',
        description: 'Morning routine',
        created_by: operatorUser.id,
      },
      {
        crew_member_id: fe4.id,
        mission_id: activeMission.id,
        name: 'EVA Preparation',
        date: new Date('2025-10-15'),
        start_hour: 8,
        duration: 2,
        type: ActivityType.EVA,
        priority: Priority.HIGH,
        mission: 'EVA-47',
        description: 'Spacewalk prep and suit check',
        equipment: ['EMU', 'Tools'],
        created_by: operatorUser.id,
      },
      {
        crew_member_id: fe4.id,
        mission_id: activeMission.id,
        name: 'Medical Check',
        date: new Date('2025-10-15'),
        start_hour: 10,
        duration: 0.5,
        type: ActivityType.WORK,
        priority: Priority.HIGH,
        mission: 'Health Monitoring',
        description: 'Routine vitals',
        equipment: ['Medical Kit'],
        created_by: operatorUser.id,
      },
      {
        crew_member_id: fe4.id,
        mission_id: activeMission.id,
        name: 'Exercise',
        date: new Date('2025-10-15'),
        start_hour: 12,
        duration: 1,
        type: ActivityType.EXERCISE,
        priority: Priority.HIGH,
        mission: 'Health & Fitness',
        description: 'ARED training',
        equipment: ['ARED'],
        created_by: operatorUser.id,
      },
      {
        crew_member_id: fe4.id,
        mission_id: activeMission.id,
        name: 'Lunch',
        date: new Date('2025-10-15'),
        start_hour: 13,
        duration: 0.5,
        type: ActivityType.MEAL,
        priority: Priority.MEDIUM,
        mission: 'Nutrition Program',
        description: 'Midday meal',
        created_by: operatorUser.id,
      },
      {
        crew_member_id: fe4.id,
        mission_id: activeMission.id,
        name: 'Pre-sleep',
        date: new Date('2025-10-15'),
        start_hour: 22,
        duration: 2,
        type: ActivityType.SLEEP,
        priority: Priority.MEDIUM,
        mission: 'Daily Operations',
        description: 'Evening routine',
        created_by: operatorUser.id,
      },

      // FE-5 Schedule
      {
        crew_member_id: fe5.id,
        mission_id: activeMission.id,
        name: 'Sleep',
        date: new Date('2025-10-15'),
        start_hour: 0,
        duration: 6,
        type: ActivityType.SLEEP,
        priority: Priority.HIGH,
        mission: 'Daily Operations',
        description: 'Night sleep period',
        created_by: operatorUser.id,
      },
      {
        crew_member_id: fe5.id,
        mission_id: activeMission.id,
        name: 'Post-sleep',
        date: new Date('2025-10-15'),
        start_hour: 6.5,
        duration: 0.5,
        type: ActivityType.SLEEP,
        priority: Priority.MEDIUM,
        mission: 'Daily Operations',
        description: 'Morning routine',
        created_by: operatorUser.id,
      },
      {
        crew_member_id: fe5.id,
        mission_id: activeMission.id,
        name: 'EVA Preparation',
        date: new Date('2025-10-15'),
        start_hour: 7,
        duration: 1.5,
        type: ActivityType.EVA,
        priority: Priority.HIGH,
        mission: 'EVA-47',
        description: 'EMU fit check',
        equipment: ['EMU'],
        created_by: operatorUser.id,
      },
      {
        crew_member_id: fe5.id,
        mission_id: activeMission.id,
        name: 'Optional Research',
        date: new Date('2025-10-15'),
        start_hour: 9,
        duration: 2,
        type: ActivityType.OPTIONAL,
        priority: Priority.LOW,
        mission: 'Science',
        description: 'Additional experiments',
        created_by: operatorUser.id,
      },
      {
        crew_member_id: fe5.id,
        mission_id: activeMission.id,
        name: 'P3 Maintenance',
        date: new Date('2025-10-15'),
        start_hour: 13,
        duration: 3,
        type: ActivityType.WORK,
        priority: Priority.HIGH,
        mission: 'Station Maintenance',
        description: 'Truss inspection',
        equipment: ['Tools'],
        created_by: operatorUser.id,
      },
      {
        crew_member_id: fe5.id,
        mission_id: activeMission.id,
        name: 'Dinner',
        date: new Date('2025-10-15'),
        start_hour: 18,
        duration: 1,
        type: ActivityType.MEAL,
        priority: Priority.MEDIUM,
        mission: 'Nutrition Program',
        description: 'Evening meal',
        created_by: operatorUser.id,
      },
      {
        crew_member_id: fe5.id,
        mission_id: activeMission.id,
        name: 'Pre-sleep',
        date: new Date('2025-10-15'),
        start_hour: 22,
        duration: 2,
        type: ActivityType.SLEEP,
        priority: Priority.MEDIUM,
        mission: 'Daily Operations',
        description: 'Wind down',
        created_by: operatorUser.id,
      },
    ];

    const createdActivities = activityRepo.create(day1Activities);
    await activityRepo.save(createdActivities);
    console.log(`✅ Created ${day1Activities.length} activities for Day 1`);

    // 5. Create Activities for Day 2 (2025-10-16) - EVA Day
    console.log('📅 Creating activities for Day 2 (EVA Day)...');

    const day2Activities: Partial<Activity>[] = [
      // FE-4 EVA Day
      {
        crew_member_id: fe4.id,
        mission_id: activeMission.id,
        name: 'Sleep',
        date: new Date('2025-10-16'),
        start_hour: 0,
        duration: 5,
        type: ActivityType.SLEEP,
        priority: Priority.HIGH,
        mission: 'Daily Operations',
        description: 'Pre-EVA sleep',
        created_by: operatorUser.id,
      },
      {
        crew_member_id: fe4.id,
        mission_id: activeMission.id,
        name: 'EVA Day',
        date: new Date('2025-10-16'),
        start_hour: 5,
        duration: 8,
        type: ActivityType.EVA,
        priority: Priority.HIGH,
        mission: 'EVA-47',
        description: 'Spacewalk execution',
        equipment: ['EMU', 'Tools', 'Tethers'],
        created_by: operatorUser.id,
      },
      {
        crew_member_id: fe4.id,
        mission_id: activeMission.id,
        name: 'Post-EVA Recovery',
        date: new Date('2025-10-16'),
        start_hour: 13,
        duration: 2,
        type: ActivityType.WORK,
        priority: Priority.HIGH,
        mission: 'EVA-47',
        description: 'Suit cleanup and debrief',
        created_by: operatorUser.id,
      },
      {
        crew_member_id: fe4.id,
        mission_id: activeMission.id,
        name: 'Meal',
        date: new Date('2025-10-16'),
        start_hour: 15,
        duration: 1,
        type: ActivityType.MEAL,
        priority: Priority.MEDIUM,
        mission: 'Nutrition Program',
        description: 'Post-EVA meal',
        created_by: operatorUser.id,
      },
      {
        crew_member_id: fe4.id,
        mission_id: activeMission.id,
        name: 'Pre-sleep',
        date: new Date('2025-10-16'),
        start_hour: 21,
        duration: 3,
        type: ActivityType.SLEEP,
        priority: Priority.HIGH,
        mission: 'Daily Operations',
        description: 'Early sleep after EVA',
        created_by: operatorUser.id,
      },

      // FE-5 EVA Day
      {
        crew_member_id: fe5.id,
        mission_id: activeMission.id,
        name: 'Sleep',
        date: new Date('2025-10-16'),
        start_hour: 0,
        duration: 5,
        type: ActivityType.SLEEP,
        priority: Priority.HIGH,
        mission: 'Daily Operations',
        description: 'Pre-EVA sleep',
        created_by: operatorUser.id,
      },
      {
        crew_member_id: fe5.id,
        mission_id: activeMission.id,
        name: 'EVA Day',
        date: new Date('2025-10-16'),
        start_hour: 5,
        duration: 8,
        type: ActivityType.EVA,
        priority: Priority.HIGH,
        mission: 'EVA-47',
        description: 'Spacewalk with FE-4',
        equipment: ['EMU', 'Tools', 'Tethers'],
        created_by: operatorUser.id,
      },
      {
        crew_member_id: fe5.id,
        mission_id: activeMission.id,
        name: 'Post-EVA',
        date: new Date('2025-10-16'),
        start_hour: 13,
        duration: 2,
        type: ActivityType.WORK,
        priority: Priority.HIGH,
        mission: 'EVA-47',
        description: 'Recovery and debrief',
        created_by: operatorUser.id,
      },
      {
        crew_member_id: fe5.id,
        mission_id: activeMission.id,
        name: 'Meal',
        date: new Date('2025-10-16'),
        start_hour: 15,
        duration: 1,
        type: ActivityType.MEAL,
        priority: Priority.MEDIUM,
        mission: 'Nutrition Program',
        description: 'Post-EVA meal',
        created_by: operatorUser.id,
      },
      {
        crew_member_id: fe5.id,
        mission_id: activeMission.id,
        name: 'Pre-sleep',
        date: new Date('2025-10-16'),
        start_hour: 21,
        duration: 3,
        type: ActivityType.SLEEP,
        priority: Priority.HIGH,
        mission: 'Daily Operations',
        description: 'Early sleep after EVA',
        created_by: operatorUser.id,
      },
    ];

    const day2Created = activityRepo.create(day2Activities);
    await activityRepo.save(day2Created);
    console.log(`✅ Created ${day2Activities.length} activities for Day 2`);

    console.log('\n✨ Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Users: 4 (admin, operator, astronaut, viewer)`);
    console.log(`   - Missions: 3 (1 active, 1 planning, 1 completed)`);
    console.log(`   - Crew Members: 4 (FE-1, FE-2, FE-4, FE-5)`);
    console.log(
      `   - Activities: ${day1Activities.length + day2Activities.length} (across 2 days)`
    );
    console.log('\n🔐 Login Credentials:');
    console.log('   admin/admin123 (Admin)');
    console.log('   operator1/operator123 (Operator)');
    console.log('   astronaut1/astronaut123 (Astronaut)');
    console.log('   viewer1/viewer123 (Viewer)\n');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await AppDataSource.destroy();
    console.log('🔌 Database connection closed');
  }
}

// Run the seed function
seed()
  .then(() => {
    console.log('👋 Exiting...');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
  