export type UserRole = 'ATHLETE' | 'COACH_PENDING' | 'COACH_VERIFIED' | 'ADMIN';
export type CoachRelationStatus = 'INVITED' | 'ACTIVE' | 'REMOVED';
export type WorkoutStatus = 'PLANNED' | 'COMPLETED' | 'SKIPPED' | 'IMPORTED';

export type CoachAccessInput = {
  role: UserRole;
  coachId: string;
  athleteId: string;
  relations: Array<{
    coachId: string;
    athleteId: string;
    status: CoachRelationStatus;
  }>;
};

export function canCoachAccessAthlete(input: CoachAccessInput): boolean {
  if (input.role === 'ADMIN') return true;
  if (input.role !== 'COACH_VERIFIED') return false;

  return input.relations.some(
    relation =>
      relation.coachId === input.coachId &&
      relation.athleteId === input.athleteId &&
      relation.status === 'ACTIVE',
  );
}

export type WorkoutSummaryInput = {
  plannedMinutes: number;
  actualMinutes?: number | null;
  status: WorkoutStatus;
};

export type WeeklyLoadSummary = {
  plannedMinutes: number;
  completedMinutes: number;
  pendingWorkouts: number;
  skippedWorkouts: number;
  consistency: number;
};

export function summarizeWeeklyLoad(workouts: WorkoutSummaryInput[]): WeeklyLoadSummary {
  const plannedMinutes = workouts.reduce((sum, workout) => sum + workout.plannedMinutes, 0);
  const completedMinutes = workouts.reduce((sum, workout) => {
    if (workout.status !== 'COMPLETED' && workout.status !== 'IMPORTED') return sum;
    return sum + (workout.actualMinutes ?? workout.plannedMinutes);
  }, 0);
  const pendingWorkouts = workouts.filter(workout => workout.status === 'PLANNED').length;
  const skippedWorkouts = workouts.filter(workout => workout.status === 'SKIPPED').length;

  return {
    plannedMinutes,
    completedMinutes,
    pendingWorkouts,
    skippedWorkouts,
    consistency: plannedMinutes === 0 ? 0 : Math.round((completedMinutes / plannedMinutes) * 100),
  };
}
