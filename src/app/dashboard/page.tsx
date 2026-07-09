import { AppHeader } from '@/components/app-header';
import { prisma } from '@/lib/prisma';
import { summarizeWeeklyLoad } from '@/lib/domain';

export const dynamic = 'force-dynamic';

function minutesLabel(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${String(mins).padStart(2, '0')}` : `${mins} min`;
}

export default async function DashboardPage() {
  const athlete = await prisma.athleteProfile.findFirst({
    where: { user: { email: 'k@demo.local' } },
    include: { workouts: { orderBy: { date: 'asc' } }, coaches: { include: { coach: { include: { user: true } } } } },
  });

  if (!athlete) {
    return <main className="shell py-6 md:py-10"><AppHeader eyebrow="Dashboard" /><div className="panel p-6">Ejecuta <code>npm run db:seed</code> para cargar datos demo.</div></main>;
  }

  const summary = summarizeWeeklyLoad(
    athlete.workouts.map(workout => ({
      plannedMinutes: workout.plannedMinutes,
      actualMinutes: workout.actualMinutes,
      status: workout.status,
    })),
  );

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const todaySession = athlete.workouts.find(workout => workout.status === 'PLANNED' && workout.date >= now)
    ?? athlete.workouts.find(workout => workout.status === 'PLANNED')
    ?? athlete.workouts[0];

  return (
    <main className="shell py-6 md:py-10">
      <AppHeader eyebrow="Dashboard" />

      <section className="panel mb-5 p-5 md:p-7">
        <span className="pill">Resumen general</span>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] md:text-5xl">Hola, {athlete.displayName}.</h1>
        <p className="mt-3 max-w-3xl text-[color:var(--muted)]">
          Vista limpia: lo importante arriba, y cada bloque en su sitio. Para detalle de sesión, entra en Hoy.
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-5">
          <a href="/today" className="panel block p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="pill">Entrenamiento de hoy</span>
              <span className="pill">Ver detalle →</span>
            </div>
            <h2 className="mt-4 text-3xl font-black">{todaySession?.title ?? 'Sin sesión planificada'}</h2>
            <p className="mt-2 text-[color:var(--muted)]">
              {todaySession ? `${todaySession.sport.toLowerCase()} · ${todaySession.plannedMinutes} min · ${todaySession.intensity}` : 'Añade una sesión para que aparezca aquí.'}
            </p>
          </a>

          <section className="panel p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black">Calendario próximo</h2>
                <p className="text-sm text-[color:var(--muted)]">Resumen compacto, sin convertir el dashboard en trastero.</p>
              </div>
              <a className="btn" href="/calendar">Abrir calendario</a>
            </div>
            <div className="grid gap-3">
              {athlete.workouts.slice(0, 3).map(workout => (
                <article key={workout.id} className="grid gap-2 rounded-3xl border border-[color:var(--line)] bg-white/70 p-4 md:grid-cols-[90px_1fr_auto] md:items-center">
                  <div><b>{workout.date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })}</b></div>
                  <div><h3 className="font-black">{workout.title}</h3><p className="text-sm text-[color:var(--muted)]">{workout.sport.toLowerCase()} · {workout.plannedMinutes} min</p></div>
                  <span className="pill">{workout.status.toLowerCase()}</span>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="grid gap-5">
          <section className="panel p-5">
            <h2 className="text-2xl font-black">Carga semanal</h2>
            <div className="card-grid mt-4">
              <Metric label="Plan" value={minutesLabel(summary.plannedMinutes)} tone="var(--sky)" />
              <Metric label="Real" value={minutesLabel(summary.completedMinutes)} tone="var(--mint)" />
              <Metric label="Cumpl." value={`${summary.consistency}%`} tone="var(--butter)" />
              <Metric label="Pend." value={`${summary.pendingWorkouts}`} tone="var(--rose)" />
            </div>
          </section>

          <section className="panel p-5">
            <h2 className="text-2xl font-black">Accesos</h2>
            <div className="mt-4 grid gap-2">
              <a className="btn" href="/today">Entrenamiento de hoy</a>
              <a className="btn" href="/calendar">Calendario</a>
              <a className="btn" href="/coach">Vista Mister</a>
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone: string }) {
  return <article className="rounded-3xl border border-[color:var(--line)] p-4" style={{ background: tone }}><p className="text-sm font-bold text-[color:var(--muted)]">{label}</p><b className="text-2xl">{value}</b></article>;
}
