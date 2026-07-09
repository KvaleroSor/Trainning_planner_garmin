import { AppHeader } from '@/components/app-header';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function CalendarPage() {
  const athlete = await prisma.athleteProfile.findFirst({
    where: { user: { email: 'k@demo.local' } },
    include: { workouts: { orderBy: { date: 'asc' } } },
  });

  return (
    <main className="shell py-6 md:py-10">
      <AppHeader eyebrow="Calendario" />

      <section className="panel mb-5 p-5 md:p-7">
        <span className="pill">Vista calendario</span>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] md:text-5xl">Plan semanal</h1>
        <p className="mt-3 max-w-3xl text-[color:var(--muted)]">
          Espacio separado para calendario y revisión. El dashboard queda limpio; aquí vive la planificación.
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {(athlete?.workouts ?? []).map(workout => (
          <article key={workout.id} className="rounded-3xl border border-[color:var(--line)] bg-white/75 p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-black text-[color:var(--muted)]">
                {workout.date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
              </p>
              <span className="pill">{workout.status.toLowerCase()}</span>
            </div>
            <h2 className="mt-3 text-2xl font-black">{workout.title}</h2>
            <p className="mt-2 text-sm text-[color:var(--muted)]">{workout.sport.toLowerCase()} · {workout.plannedMinutes} min · {workout.intensity}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
