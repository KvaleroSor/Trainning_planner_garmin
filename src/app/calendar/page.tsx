import { AppHeader } from '@/components/app-header';
import { requireAthleteProfile } from '@/lib/access';
import { getMonthWindow, parseCalendarMonth } from '@/lib/domain';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

type CalendarPageProps = {
  searchParams: Promise<{ month?: string }>;
};

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const { athlete: currentAthlete } = await requireAthleteProfile();
  const { month: monthQuery } = await searchParams;
  const month = parseCalendarMonth(monthQuery, new Date('2026-07-01T00:00:00.000Z'));
  const calendar = getMonthWindow(month);

  const athlete = await prisma.athleteProfile.findUnique({
    where: { id: currentAthlete.id },
    include: {
      workouts: {
        where: {
          date: {
            gte: new Date(`${calendar.startIso}T00:00:00.000Z`),
            lte: new Date(`${calendar.endIso}T23:59:59.999Z`),
          },
        },
        orderBy: { date: 'asc' },
      },
    },
  });

  const workoutsByDate = new Map<string, NonNullable<typeof athlete>['workouts']>();
  for (const workout of athlete?.workouts ?? []) {
    const key = isoDate(workout.date);
    workoutsByDate.set(key, [...(workoutsByDate.get(key) ?? []), workout]);
  }

  return (
    <main className="shell py-6 md:py-10">
      <AppHeader eyebrow="Calendario" active="calendar" />

      <section className="panel mb-5 p-5 md:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="pill">Vista calendario real</span>
            <h1 className="mt-4 text-4xl font-black capitalize tracking-[-0.04em] md:text-5xl">{calendar.label}</h1>
            <p className="mt-3 max-w-3xl text-[color:var(--muted)]">
              Fechas reales por mes. No hay rango fijo 1–31 ni julio eterno con sombrero de copa.
            </p>
          </div>
          <div className="flex gap-2">
            <a className="btn" href={`/calendar?month=${calendar.previousMonth}`}>← Mes anterior</a>
            <a className="btn btn-primary" href={`/calendar?month=${calendar.nextMonth}`}>Mes siguiente →</a>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-7">
        {calendar.days.map(day => {
          const workouts = workoutsByDate.get(day.iso) ?? [];
          return (
            <article key={day.iso} className="min-h-36 rounded-3xl border border-[color:var(--line)] bg-white/75 p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-black uppercase text-[color:var(--muted)]">{day.weekday}</p>
                  <h2 className="text-2xl font-black">{day.day}</h2>
                </div>
                {workouts.length > 0 && <span className="pill">{workouts.length} sesión</span>}
              </div>
              <div className="grid gap-2">
                {workouts.length === 0 ? (
                  <p className="text-sm text-[color:var(--muted)]">Sin carga</p>
                ) : workouts.map(workout => (
                  <div key={workout.id} className="rounded-2xl bg-[color:var(--sky)] px-3 py-2 text-sm font-bold">
                    <span className="block truncate">{workout.title}</span>
                    <span className="text-xs text-[color:var(--muted)]">{workout.sport.toLowerCase()} · {workout.plannedMinutes} min</span>
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
