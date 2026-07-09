import { AppHeader } from '@/components/app-header';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

type AthleteDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AthleteDetailPage({ params }: AthleteDetailPageProps) {
  const { id } = await params;

  const relation = await prisma.coachAthleteRelation.findFirst({
    where: {
      status: 'ACTIVE',
      athleteId: id,
      coach: { user: { email: 'coach@trainingplanner.local', role: 'COACH_VERIFIED' } },
    },
    include: {
      athlete: {
        include: {
          user: true,
          workouts: { orderBy: { date: 'asc' }, take: 5 },
        },
      },
      coach: { include: { user: true } },
    },
  });

  if (!relation) {
    return (
      <main className="shell grid min-h-screen place-items-center py-8">
        <section className="panel w-full max-w-md p-6 md:p-8">
          <span className="pill">Acceso restringido</span>
          <h1 className="mt-4 text-3xl font-black tracking-[-0.04em]">Ficha no disponible</h1>
          <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
            Solo un Mister verificado con relación activa puede consultar esta ficha de atleta.
          </p>
        </section>
      </main>
    );
  }

  const { athlete } = relation;
  const nextWorkout = athlete.workouts.find(workout => workout.status === 'PLANNED') ?? athlete.workouts[0];

  return (
    <main className="shell py-6 md:py-10">
      <AppHeader eyebrow="Ficha atleta" />

      <nav className="mb-4">
        <a className="btn" href="/coach">← Volver al roster</a>
      </nav>

      <section className="panel mb-5 p-5 md:p-7">
        <span className="pill">Seguimiento</span>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] md:text-5xl">{athlete.displayName}</h1>
        <p className="mt-3 max-w-3xl text-[color:var(--muted)]">
          Próxima sesión y análisis del atleta. Objetivos y perfil viven en su bloque, no duplicados en portada.
        </p>
      </section>

      <section className="mobile-stack">
        <div className="grid gap-5">
          <section className="panel p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-black">Próxima sesión</h2>
              <a className="btn" href="/today">Ver formato atleta</a>
            </div>
            {nextWorkout ? (
              <article className="mt-4 rounded-3xl border border-[color:var(--line)] bg-white/70 p-5">
                <span className="pill">{nextWorkout.status.toLowerCase()}</span>
                <h3 className="mt-3 text-3xl font-black">{nextWorkout.title}</h3>
                <p className="mt-2 text-[color:var(--muted)]">
                  {nextWorkout.date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })} · {nextWorkout.sport.toLowerCase()} · {nextWorkout.plannedMinutes} min · {nextWorkout.intensity}
                </p>
              </article>
            ) : <p className="mt-4 text-[color:var(--muted)]">Sin sesiones cargadas.</p>}
          </section>

          <section className="panel p-5">
            <h2 className="text-2xl font-black">Entrenos recientes/próximos</h2>
            <div className="mt-4 grid gap-3">
              {athlete.workouts.map(workout => (
                <article key={workout.id} className="rounded-3xl border border-[color:var(--line)] bg-white/70 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-black">{workout.title}</h3>
                      <p className="text-sm text-[color:var(--muted)]">
                        {workout.date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })} · {workout.sport.toLowerCase()} · {workout.plannedMinutes} min
                      </p>
                    </div>
                    <span className="pill">{workout.status.toLowerCase()}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="panel p-5">
            <h2 className="text-2xl font-black">Planificado vs realizado</h2>
            <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
              Siguiente paso: conectar GarminActivity para comparar duración, ritmo, FC, potencia, cadencia, splits y ruta contra el entrenamiento planificado.
            </p>
          </section>
        </div>

        <aside className="grid gap-5">
          <section className="panel p-5">
            <h2 className="text-2xl font-black">Objetivos y perfil</h2>
            <div className="mt-4 grid gap-3 text-sm">
              <Info label="Objetivo" value={athlete.objective} />
              <Info label="Deporte" value={athlete.primarySport.toLowerCase()} />
              <Info label="Horas/semana" value={`${athlete.weeklyHours} h`} />
              <Info label="Peso" value={athlete.weightKg ? `${athlete.weightKg} kg` : '—'} />
              <Info label="FC reposo" value={athlete.restingHr ? `${athlete.restingHr} ppm` : '—'} />
              <Info label="FTP" value={athlete.ftp ? `${athlete.ftp} W` : '—'} />
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="grid gap-1 rounded-2xl bg-white/70 px-4 py-3"><span className="text-[color:var(--muted)]">{label}</span><b>{value}</b></div>;
}
