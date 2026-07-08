import { prisma } from '@/lib/prisma';
import { buildCoachRoster } from '@/lib/domain';

export const dynamic = 'force-dynamic';

const sportTone: Record<string, string> = {
  CYCLING: 'var(--sky)',
  RUNNING: 'var(--mint)',
  SWIMMING: 'var(--lilac)',
  STRENGTH: 'var(--rose)',
  TRIATHLON: 'var(--butter)',
  MOBILITY: 'var(--line)',
};

export default async function CoachPage() {
  const coachUser = await prisma.user.findUnique({
    where: { email: 'coach@trainingplanner.local' },
    include: {
      coachProfile: {
        include: {
          athletes: {
            where: { status: 'ACTIVE' },
            include: {
              athlete: {
                include: {
                  user: true,
                  workouts: { orderBy: { date: 'asc' } },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!coachUser || coachUser.role !== 'COACH_VERIFIED' || !coachUser.coachProfile) {
    return (
      <main className="shell grid min-h-screen place-items-center py-8">
        <section className="panel w-full max-w-md p-6 md:p-8">
          <span className="pill">Acceso restringido</span>
          <h1 className="mt-4 text-3xl font-black tracking-[-0.04em]">Vista Mister</h1>
          <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
            El acceso al roster de atletas requiere un perfil de Mister verificado.
            Si crees que deberías tener acceso, contacta con el administrador.
          </p>
        </section>
      </main>
    );
  }

  const rosterAthletes = coachUser.coachProfile.athletes.map(relation => ({
    id: relation.athlete.id,
    displayName: relation.athlete.displayName,
    primarySport: relation.athlete.primarySport,
    objective: relation.athlete.objective,
    weeklyHours: relation.athlete.weeklyHours,
    user: { name: relation.athlete.user?.name, email: relation.athlete.user?.email },
    workouts: relation.athlete.workouts.map(workout => ({
      id: workout.id,
      date: workout.date,
      title: workout.title,
      status: workout.status,
      plannedMinutes: workout.plannedMinutes,
      sport: workout.sport,
    })),
  }));

  const roster = buildCoachRoster(rosterAthletes);

  return (
    <main className="shell py-6 md:py-10">
      <nav className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 font-black">
          <span className="grid size-11 place-items-center rounded-2xl bg-white shadow-sm">TP</span>
          <span>Training Planner</span>
        </div>
        <span className="pill">Mister verificado</span>
      </nav>

      <section className="panel mb-5 p-5 md:p-7">
        <span className="pill">Roster de atletas</span>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] md:text-5xl">
          Hola, {coachUser.name || 'Mister'}.
        </h1>
        <p className="mt-3 max-w-3xl text-[color:var(--muted)]">
          Gestiona tus atletas activos, revisa su carga semanal y próximos entrenos.
        </p>
      </section>

      <section className="grid gap-3">
        {roster.map(athlete => (
          <article
            key={athlete.id}
            className="flex flex-col gap-3 rounded-3xl border border-[color:var(--line)] bg-white/70 p-4 md:flex-row md:items-center md:justify-between"
          >
            <div className="flex items-center gap-4">
              <span
                className="size-3 rounded-full"
                style={{ background: sportTone[athlete.sport] ?? 'var(--muted)' }}
              />
              <div>
                <h3 className="text-lg font-black">{athlete.name}</h3>
                <p className="text-sm text-[color:var(--muted)]">
                  {athlete.sport.toLowerCase()} · {athlete.objective}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 md:gap-6">
              <div className="text-sm">
                <p className="text-[color:var(--muted)]">Horas/semana</p>
                <b>{athlete.weeklyHours} h</b>
              </div>
              {athlete.latestWorkout && (
                <div className="text-sm">
                  <p className="text-[color:var(--muted)]">Último</p>
                  <b>{athlete.latestWorkout}</b>
                </div>
              )}
              {athlete.nextWorkout && (
                <div className="text-sm">
                  <p className="text-[color:var(--muted)]">Próximo</p>
                  <b>{athlete.nextWorkout}</b>
                </div>
              )}
              <a className="btn btn-primary ml-auto" href={`/coach/athletes/${athlete.id}`}>
                Ver detalle
              </a>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
