import { describe, expect, it } from 'vitest';
import {
  canCoachAccessAthlete,
  summarizeWeeklyLoad,
  buildCoachRoster,
  type CoachAccessInput,
  type WorkoutSummaryInput,
  type RosterAthleteInput,
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
