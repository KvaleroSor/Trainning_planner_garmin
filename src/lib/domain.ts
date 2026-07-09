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

export type PlanVsActualInput = {
  title: string;
  plannedMinutes: number;
  actualMinutes: number;
  avgHr?: number | null;
  avgPower?: number | null;
  distanceMeters?: number | null;
};

export type PlanVsActualSignal = 'under' | 'on-track' | 'over';

export type PlanVsActualSummary = {
  title: string;
  plannedMinutes: number;
  actualMinutes: number;
  deltaMinutes: number;
  compliance: number;
  signal: PlanVsActualSignal;
  coachCopy: string;
  athleteCopy: string;
  metrics: string[];
};

export function analyzePlanVsActual(input: PlanVsActualInput): PlanVsActualSummary {
  const deltaMinutes = input.actualMinutes - input.plannedMinutes;
  const compliance = input.plannedMinutes === 0 ? 0 : Math.round((input.actualMinutes / input.plannedMinutes) * 100);
  const signal: PlanVsActualSignal = compliance < 90 ? 'under' : compliance > 110 ? 'over' : 'on-track';
  const absDelta = Math.abs(deltaMinutes);
  const directionCopy = deltaMinutes >= 0 ? 'por encima del plan' : 'por debajo del plan';

  const metrics = [
    input.distanceMeters ? `${(input.distanceMeters / 1000).toFixed(1)} km` : null,
    input.avgHr ? `${input.avgHr} ppm` : null,
    input.avgPower ? `${input.avgPower} W` : null,
  ].filter((metric): metric is string => Boolean(metric));

  return {
    title: input.title,
    plannedMinutes: input.plannedMinutes,
    actualMinutes: input.actualMinutes,
    deltaMinutes,
    compliance,
    signal,
    coachCopy: signal === 'on-track'
      ? `${input.title} quedó dentro del rango previsto; buen cumplimiento del plan.`
      : `${input.title} se fue ${absDelta} min ${directionCopy}; revisar fatiga y si el extra fue intencional.`,
    athleteCopy: signal === 'on-track'
      ? 'Sesión ajustada a lo previsto. Buena ejecución.'
      : deltaMinutes > 0
        ? `Te pasaste ${absDelta} min sobre lo previsto. Compensa si notas carga alta.`
        : `Te quedaste ${absDelta} min por debajo de lo previsto. Anota el motivo para tu mister.`,
    metrics,
  };
}

export type PersonalRecordActivityInput = {
  sport: string;
  distanceMeters?: number | null;
  durationSeconds: number;
  fastestKmSeconds?: number | null;
  avgPower?: number | null;
  maxPower?: number | null;
};

export type PersonalRecord = {
  label: string;
  value: string;
  sport: string;
};

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function findPersonalRecords(activities: PersonalRecordActivityInput[]): PersonalRecord[] {
  const records: PersonalRecord[] = [];
  const running = activities.filter(activity => activity.sport === 'RUNNING');
  const cycling = activities.filter(activity => activity.sport === 'CYCLING');

  const fastestKm = running
    .filter(activity => activity.fastestKmSeconds)
    .sort((a, b) => (a.fastestKmSeconds ?? Infinity) - (b.fastestKmSeconds ?? Infinity))[0];
  if (fastestKm?.fastestKmSeconds) {
    records.push({ label: 'Km más rápido', value: `${formatDuration(fastestKm.fastestKmSeconds)}/km`, sport: 'RUNNING' });
  }

  for (const [label, meters] of [['5K', 5000], ['10K', 10000]] as const) {
    const best = running
      .filter(activity => (activity.distanceMeters ?? 0) >= meters)
      .sort((a, b) => a.durationSeconds - b.durationSeconds)[0];
    if (best) records.push({ label, value: formatDuration(best.durationSeconds), sport: 'RUNNING' });
  }

  const bestAvgPower = cycling
    .filter(activity => activity.avgPower)
    .sort((a, b) => (b.avgPower ?? 0) - (a.avgPower ?? 0))[0];
  if (bestAvgPower?.avgPower) {
    records.push({ label: 'Mejor potencia media', value: `${bestAvgPower.avgPower} W`, sport: 'CYCLING' });
  }

  const bestMaxPower = cycling
    .filter(activity => activity.maxPower)
    .sort((a, b) => (b.maxPower ?? 0) - (a.maxPower ?? 0))[0];
  if (bestMaxPower?.maxPower) {
    records.push({ label: 'Pico potencia', value: `${bestMaxPower.maxPower} W`, sport: 'CYCLING' });
  }

  return records;
}

export type CalendarMonthDay = {
  iso: string;
  day: number;
  weekday: string;
};

export type CalendarMonthWindow = {
  month: string;
  label: string;
  startIso: string;
  endIso: string;
  previousMonth: string;
  nextMonth: string;
  days: CalendarMonthDay[];
};

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

function toMonthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}`;
}

export function parseCalendarMonth(value?: string, fallback = new Date()): string {
  if (value && /^\d{4}-(0[1-9]|1[0-2])$/.test(value)) return value;
  return toMonthKey(new Date(Date.UTC(fallback.getUTCFullYear(), fallback.getUTCMonth(), 1)));
}

export function getMonthWindow(month: string): CalendarMonthWindow {
  const [year, monthNumber] = month.split('-').map(Number);
  const monthIndex = monthNumber - 1;
  const start = new Date(Date.UTC(year, monthIndex, 1));
  const end = new Date(Date.UTC(year, monthIndex + 1, 0));
  const previous = new Date(Date.UTC(year, monthIndex - 1, 1));
  const next = new Date(Date.UTC(year, monthIndex + 1, 1));

  const days: CalendarMonthDay[] = [];
  for (let day = 1; day <= end.getUTCDate(); day += 1) {
    const date = new Date(Date.UTC(year, monthIndex, day));
    days.push({
      iso: `${year}-${pad2(monthNumber)}-${pad2(day)}`,
      day,
      weekday: date.toLocaleDateString('es-ES', { weekday: 'short', timeZone: 'UTC' }).replace('.', ''),
    });
  }

  return {
    month,
    label: start.toLocaleDateString('es-ES', { month: 'long', year: 'numeric', timeZone: 'UTC' }).replace(' de ', ' '),
    startIso: `${year}-${pad2(monthNumber)}-01`,
    endIso: `${year}-${pad2(monthNumber)}-${pad2(end.getUTCDate())}`,
    previousMonth: toMonthKey(previous),
    nextMonth: toMonthKey(next),
    days,
  };
}
