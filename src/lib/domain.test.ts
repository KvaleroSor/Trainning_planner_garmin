import { describe, expect, it } from 'vitest';
import {
  canCoachAccessAthlete,
  summarizeWeeklyLoad,
  buildCoachRoster,
  analyzePlanVsActual,
  findPersonalRecords,
  getMonthWindow,
  parseCalendarMonth,
  type CoachAccessInput,
  type WorkoutSummaryInput,
  type RosterAthleteInput,
  type PlanVsActualInput,
  type PersonalRecordActivityInput,
} from './domain';

describe('coach access rules', () => {
  it('allows only verified coaches with an active athlete relation', () => {
    const allowed: CoachAccessInput = {
      role: 'COACH_VERIFIED',
      coachId: 'coach-1',
      athleteId: 'athlete-1',
      relations: [{ coachId: 'coach-1', athleteId: 'athlete-1', status: 'ACTIVE' }],
    };

    expect(canCoachAccessAthlete(allowed)).toBe(true);
  });

  it('rejects pending coaches even if a relation row exists', () => {
    const pending: CoachAccessInput = {
      role: 'COACH_PENDING',
      coachId: 'coach-1',
      athleteId: 'athlete-1',
      relations: [{ coachId: 'coach-1', athleteId: 'athlete-1', status: 'ACTIVE' }],
    };

    expect(canCoachAccessAthlete(pending)).toBe(false);
  });

  it('rejects verified coaches without an active relation to that athlete', () => {
    const missingRelation: CoachAccessInput = {
      role: 'COACH_VERIFIED',
      coachId: 'coach-1',
      athleteId: 'athlete-2',
      relations: [{ coachId: 'coach-1', athleteId: 'athlete-1', status: 'ACTIVE' }],
    };

    expect(canCoachAccessAthlete(missingRelation)).toBe(false);
  });
});

describe('weekly load summary', () => {
  it('summarizes planned, completed, pending, and consistency from workouts', () => {
    const workouts: WorkoutSummaryInput[] = [
      { plannedMinutes: 60, actualMinutes: 60, status: 'COMPLETED' },
      { plannedMinutes: 90, actualMinutes: 42, status: 'IMPORTED' },
      { plannedMinutes: 45, status: 'PLANNED' },
      { plannedMinutes: 30, status: 'SKIPPED' },
    ];

    expect(summarizeWeeklyLoad(workouts)).toEqual({
      plannedMinutes: 225,
      completedMinutes: 102,
      pendingWorkouts: 1,
      skippedWorkouts: 1,
      consistency: 45,
    });
  });
});

describe('coach roster', () => {
  it('sorts athletes alphabetically and surfaces latest/next workouts', () => {
    const athletes: RosterAthleteInput[] = [
      {
        id: 'a2',
        displayName: 'Bea',
        primarySport: 'RUNNING',
        objective: '10K sub 50',
        weeklyHours: 5,
        workouts: [
          { id: 'w1', date: new Date('2026-07-01'), title: 'Fartlek', status: 'COMPLETED', plannedMinutes: 40, sport: 'RUNNING' },
          { id: 'w2', date: new Date('2026-07-05'), title: 'Larga', status: 'PLANNED', plannedMinutes: 70, sport: 'RUNNING' },
        ],
      },
      {
        id: 'a1',
        displayName: 'Alex',
        primarySport: 'CYCLING',
        objective: 'Mejorar FTP',
        weeklyHours: 8,
        workouts: [
          { id: 'w3', date: new Date('2026-07-02'), title: 'Z2', status: 'COMPLETED', plannedMinutes: 90, sport: 'CYCLING' },
          { id: 'w4', date: new Date('2026-07-04'), title: 'Intervalos', status: 'PLANNED', plannedMinutes: 60, sport: 'CYCLING' },
        ],
      },
    ];

    const roster = buildCoachRoster(athletes);

    expect(roster.map(r => r.name)).toEqual(['Alex', 'Bea']);
    expect(roster[0].latestWorkout).toBe('Z2 \u00b7 90 min');
    expect(roster[0].nextWorkout).toBe('Intervalos \u00b7 60 min');
    expect(roster[1].latestWorkout).toBe('Fartlek \u00b7 40 min');
    expect(roster[1].nextWorkout).toBe('Larga \u00b7 70 min');
  });

  it('returns null workout hints when no workouts exist', () => {
    const athletes: RosterAthleteInput[] = [
      {
        id: 'a1',
        displayName: 'Alex',
        primarySport: 'CYCLING',
        objective: 'Mejorar FTP',
        weeklyHours: 6,
      },
    ];

    const roster = buildCoachRoster(athletes);

    expect(roster).toHaveLength(1);
    expect(roster[0].name).toBe('Alex');
    expect(roster[0].latestWorkout).toBeNull();
    expect(roster[0].nextWorkout).toBeNull();
  });
});

describe('plan vs actual analysis', () => {
  it('turns Garmin activity into a coach-readable compliance signal', () => {
    const input: PlanVsActualInput = {
      title: 'Bici Z2',
      plannedMinutes: 90,
      actualMinutes: 102,
      avgHr: 151,
      avgPower: 212,
      distanceMeters: 42000,
    };

    expect(analyzePlanVsActual(input)).toEqual({
      title: 'Bici Z2',
      plannedMinutes: 90,
      actualMinutes: 102,
      deltaMinutes: 12,
      compliance: 113,
      signal: 'over',
      coachCopy: 'Bici Z2 se fue 12 min por encima del plan; revisar fatiga y si el extra fue intencional.',
      athleteCopy: 'Te pasaste 12 min sobre lo previsto. Compensa si notas carga alta.',
      metrics: ['42.0 km', '151 ppm', '212 W'],
    });
  });
});

describe('personal records', () => {
  it('extracts fastest kilometer and cycling power records from activities', () => {
    const activities: PersonalRecordActivityInput[] = [
      { sport: 'RUNNING', distanceMeters: 5000, durationSeconds: 1500, fastestKmSeconds: 238 },
      { sport: 'RUNNING', distanceMeters: 10000, durationSeconds: 3100, fastestKmSeconds: 245 },
      { sport: 'CYCLING', durationSeconds: 3600, avgPower: 215, maxPower: 540 },
      { sport: 'CYCLING', durationSeconds: 2700, avgPower: 230, maxPower: 520 },
    ];

    expect(findPersonalRecords(activities)).toEqual([
      { label: 'Km más rápido', value: '3:58/km', sport: 'RUNNING' },
      { label: '5K', value: '25:00', sport: 'RUNNING' },
      { label: '10K', value: '51:40', sport: 'RUNNING' },
      { label: 'Mejor potencia media', value: '230 W', sport: 'CYCLING' },
      { label: 'Pico potencia', value: '540 W', sport: 'CYCLING' },
    ]);
  });
});

describe('calendar month helpers', () => {
  it('parses valid YYYY-MM months and exposes real previous/next month links', () => {
    const window = getMonthWindow(parseCalendarMonth('2026-08'));

    expect(window.label).toBe('agosto 2026');
    expect(window.startIso).toBe('2026-08-01');
    expect(window.endIso).toBe('2026-08-31');
    expect(window.days).toHaveLength(31);
    expect(window.days[0].iso).toBe('2026-08-01');
    expect(window.days[0].weekday).toBe('sáb');
    expect(window.days[30].iso).toBe('2026-08-31');
    expect(window.previousMonth).toBe('2026-07');
    expect(window.nextMonth).toBe('2026-09');
  });

  it('falls back to current month for invalid query strings', () => {
    const current = new Date('2027-02-10T12:00:00.000Z');

    expect(parseCalendarMonth('julio', current)).toBe('2027-02');
    expect(parseCalendarMonth(undefined, current)).toBe('2027-02');
  });
});
