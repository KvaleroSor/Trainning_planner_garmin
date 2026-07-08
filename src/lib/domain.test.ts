import { describe, expect, it } from 'vitest';
import {
  canCoachAccessAthlete,
  summarizeWeeklyLoad,
  type CoachAccessInput,
  type WorkoutSummaryInput,
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
