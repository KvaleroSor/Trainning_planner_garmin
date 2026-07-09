import { AppHeader } from '@/components/app-header';
import { requireVerifiedCoach } from '@/lib/access';
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
  const { user: coachUser, coach } = await requireVerifiedCoach();
  const coachProfile = await prisma.coachProfile.findUnique({
    where: { id: coach.id },
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
  });

  if (!coachProfile) {
    throw new Error('Verified coach profile missing');
  }

  const rosterAthletes = coachProfile.athletes.map(relation => ({
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
      <AppHeader eyebrow="Mister" active="coach" />

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
