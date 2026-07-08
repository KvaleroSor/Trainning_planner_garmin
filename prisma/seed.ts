import { PrismaClient, UserRole, CoachStatus, RelationStatus, SportType, WorkoutSource, WorkoutStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('demo1234', 10);

  const coachUser = await prisma.user.upsert({
    where: { email: 'coach@trainingplanner.local' },
    update: {},
    create: {
      name: 'Mister Demo',
      email: 'coach@trainingplanner.local',
      passwordHash,
      role: UserRole.COACH_VERIFIED,
      coachProfile: {
        create: {
          status: CoachStatus.VERIFIED,
          organization: 'Training Planner Demo Club',
          accreditation: 'Demo verified coach',
          verifiedAt: new Date(),
        },
      },
    },
    include: { coachProfile: true },
  });

  const athleteUser = await prisma.user.upsert({
    where: { email: 'k@demo.local' },
    update: {},
    create: {
      name: 'K',
      email: 'k@demo.local',
      passwordHash,
      role: UserRole.ATHLETE,
      athleteProfile: {
        create: {
          displayName: 'K',
          primarySport: SportType.CYCLING,
          objective: 'Mejorar FTP y fondo',
          weeklyHours: 6,
          weightKg: 75.5,
          heightCm: 178,
          restingHr: 48,
          maxHr: 184,
          thresholdHr: 168,
          ftp: 240,
        },
      },
    },
    include: { athleteProfile: true },
  });

  if (!coachUser.coachProfile || !athleteUser.athleteProfile) {
    throw new Error('Seed profiles were not created');
  }

  await prisma.coachAthleteRelation.upsert({
    where: {
      coachId_athleteId: {
        coachId: coachUser.coachProfile.id,
        athleteId: athleteUser.athleteProfile.id,
      },
    },
    update: { status: RelationStatus.ACTIVE },
    create: {
      coachId: coachUser.coachProfile.id,
      athleteId: athleteUser.athleteProfile.id,
      status: RelationStatus.ACTIVE,
    },
  });

  const baseDate = new Date('2026-07-01T08:00:00.000Z');
  await prisma.workout.deleteMany({ where: { athleteId: athleteUser.athleteProfile.id } });
  await prisma.workout.createMany({
    data: [
      {
        athleteId: athleteUser.athleteProfile.id,
        title: 'Z2 resistencia',
        sport: SportType.CYCLING,
        date: baseDate,
        plannedMinutes: 60,
        actualMinutes: 60,
        intensity: 'Z2',
        status: WorkoutStatus.COMPLETED,
        source: WorkoutSource.TEMPLATE,
      },
      {
        athleteId: athleteUser.athleteProfile.id,
        title: 'Bici Z2',
        sport: SportType.CYCLING,
        date: new Date('2026-07-03T08:00:00.000Z'),
        plannedMinutes: 90,
        actualMinutes: 42,
        intensity: 'Z2',
        status: WorkoutStatus.IMPORTED,
        source: WorkoutSource.GARMIN,
      },
      {
        athleteId: athleteUser.athleteProfile.id,
        title: 'Fuerza core',
        sport: SportType.STRENGTH,
        date: new Date('2026-07-05T08:00:00.000Z'),
        plannedMinutes: 45,
        intensity: 'RPE 6',
        status: WorkoutStatus.PLANNED,
        source: WorkoutSource.TEMPLATE,
      },
    ],
  });

  console.log('Seed complete: coach@trainingplanner.local / k@demo.local');
}

main()
  .catch(error => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
