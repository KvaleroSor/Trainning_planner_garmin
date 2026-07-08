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

export type RosterWorkoutInput = {
  id: string;
  date: Date;
  title: string;
  status: string;
  plannedMinutes: number;
  sport: string;
};

export type RosterAthleteInput = {
  id: string;
  displayName: string;
  primarySport: string;
  objective: string;
  weeklyHours: number;
  user?: { name?: string | null; email?: string | null } | null;
  workouts?: RosterWorkoutInput[];
};

export type CoachRosterAthlete = {
  id: string;
  name: string;
  sport: string;
  objective: string;
  weeklyHours: number;
  latestWorkout: string | null;
  nextWorkout: string | null;
};

export function buildCoachRoster(athletes: RosterAthleteInput[]): CoachRosterAthlete[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return athletes
    .map(a => {
      const workouts = a.workouts ?? [];
      const planned = workouts
        .filter(w => w.status === 'PLANNED')
        .sort((w1, w2) => w1.date.getTime() - w2.date.getTime());
      const next = planned.find(w => w.date.getTime() >= today.getTime()) ?? planned[0] ?? null;
      const latest = [...workouts].reverse().find(w => w.status === 'COMPLETED' || w.status === 'IMPORTED');
      return {
        id: a.id,
        name: a.displayName || a.user?.name || 'Atleta',
        sport: a.primarySport,
        objective: a.objective,
        weeklyHours: a.weeklyHours,
        latestWorkout: latest ? `${latest.title} · ${latest.plannedMinutes} min` : null,
        nextWorkout: next ? `${next.title} · ${next.plannedMinutes} min` : null,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}
