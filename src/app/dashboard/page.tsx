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
    return <main className="shell py-10"><div className="panel p-6">Ejecuta <code>npm run db:seed</code> para cargar datos demo.</div></main>;
  }

  const summary = summarizeWeeklyLoad(
    athlete.workouts.map(workout => ({
      plannedMinutes: workout.plannedMinutes,
      actualMinutes: workout.actualMinutes,
      status: workout.status,
    })),
  );

  return (
    <main className="shell py-6 md:py-10">
      <nav className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 font-black"><span className="grid size-11 place-items-center rounded-2xl bg-white shadow-sm">TP</span>Training Planner</div>
        <div className="flex gap-2"><span className="pill">Atleta</span><span className="pill">Mister verificado listo</span></div>
      </nav>

      <section className="panel mb-5 p-5 md:p-7">
        <span className="pill">Dashboard backend seed</span>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] md:text-5xl">Hola, {athlete.displayName}.</h1>
        <p className="mt-3 max-w-3xl text-[color:var(--muted)]">Primer tracer Next: datos desde Prisma, resumen semanal real y base preparada para permisos server-side. Sin localStorage haciendo de becario con root.</p>
      </section>

      <section className="mobile-stack">
        <div className="grid gap-5">
          <section className="panel p-5">
            <div className="flex items-start justify-between gap-3">
              <div><p className="text-sm font-bold text-[color:var(--muted)]">Objetivo</p><h2 className="text-3xl font-black">{athlete.objective}</h2></div>
              <span className="pill">{athlete.primarySport.toLowerCase()}</span>
            </div>
            <div className="card-grid mt-5">
              <Metric label="Plan" value={minutesLabel(summary.plannedMinutes)} tone="var(--sky)" />
              <Metric label="Real" value={minutesLabel(summary.completedMinutes)} tone="var(--mint)" />
              <Metric label="Cumpl." value={`${summary.consistency}%`} tone="var(--butter)" />
              <Metric label="Pend." value={`${summary.pendingWorkouts}`} tone="var(--rose)" />
            </div>
          </section>

          <section className="panel p-5">
            <div className="mb-4 flex items-center justify-between"><h2 className="text-2xl font-black">Calendario seed</h2><span className="pill">Julio 2026</span></div>
            <div className="grid gap-3">
              {athlete.workouts.map(workout => (
                <article key={workout.id} className="grid gap-2 rounded-3xl border border-[color:var(--line)] bg-white/70 p-4 md:grid-cols-[90px_1fr_auto] md:items-center">
                  <div><b>{workout.date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })}</b></div>
                  <div><h3 className="font-black">{workout.title}</h3><p className="text-sm text-[color:var(--muted)]">{workout.sport.toLowerCase()} · {workout.plannedMinutes} min · {workout.intensity}</p></div>
                  <span className="pill">{workout.status.toLowerCase()}</span>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="grid gap-5">
          <section className="panel p-5">
            <h2 className="text-2xl font-black">Stats atleta</h2>
            <div className="mt-4 grid gap-3 text-sm">
              <Info label="Horas/sem" value={`${athlete.weeklyHours}`} />
              <Info label="Peso" value={athlete.weightKg ? `${athlete.weightKg} kg` : '—'} />
              <Info label="FC reposo" value={athlete.restingHr ? `${athlete.restingHr} ppm` : '—'} />
              <Info label="FTP" value={athlete.ftp ? `${athlete.ftp} W` : '—'} />
            </div>
          </section>
          <section className="panel p-5">
            <h2 className="text-2xl font-black">Coach access</h2>
            <p className="mt-2 text-sm text-[color:var(--muted)]">{athlete.coaches.length} relación activa preparada. La vista Mister se protegerá por rol y relación, no por cosmética frontend.</p>
          </section>
        </aside>
      </section>
    </main>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone: string }) {
  return <article className="rounded-3xl border border-[color:var(--line)] p-4" style={{ background: tone }}><p className="text-sm font-bold text-[color:var(--muted)]">{label}</p><b className="text-2xl">{value}</b></article>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3"><span className="text-[color:var(--muted)]">{label}</span><b>{value}</b></div>;
}
