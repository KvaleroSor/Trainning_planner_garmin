import { AppHeader } from '@/components/app-header';
import { AthleteSubnav } from '@/components/athlete-subnav';
import { requireActiveCoachAthleteRelation } from '@/lib/access';
import { findPersonalRecords, type PersonalRecordActivityInput } from '@/lib/domain';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

type AthleteStatsPageProps = {
  params: Promise<{ id: string }>;
};

type RawSummary = { fastestKmSeconds?: number; maxPower?: number };

function parseRawSummary(raw: unknown): RawSummary {
  if (!raw || typeof raw !== 'object') return {};
  const candidate = raw as Record<string, unknown>;
  return {
    fastestKmSeconds: typeof candidate.fastestKmSeconds === 'number' ? candidate.fastestKmSeconds : undefined,
    maxPower: typeof candidate.maxPower === 'number' ? candidate.maxPower : undefined,
  };
}

export default async function AthleteStatsPage({ params }: AthleteStatsPageProps) {
  const { id } = await params;
  const { relation: allowedRelation } = await requireActiveCoachAthleteRelation(id);

  const relation = await prisma.coachAthleteRelation.findUnique({
    where: { id: allowedRelation.id },
    include: {
      athlete: {
        include: {
          garminActivities: { orderBy: { startedAt: 'desc' } },
        },
      },
    },
  });

  if (!relation) {
    return <Guarded />;
  }

  const activities: PersonalRecordActivityInput[] = relation.athlete.garminActivities.map(activity => {
    const raw = parseRawSummary(activity.rawSummary);
    return {
      sport: activity.sport,
      distanceMeters: activity.distanceMeters,
      durationSeconds: activity.durationMinutes * 60,
      fastestKmSeconds: raw.fastestKmSeconds,
      avgPower: activity.avgPower,
      maxPower: raw.maxPower,
    };
  });
  const records = findPersonalRecords(activities);

  return (
    <main className="shell py-6 md:py-10">
      <AppHeader eyebrow="Stats atleta" active="coach" />
      <AthleteSubnav athleteId={id} active="stats" />

      <section className="panel mb-5 p-5 md:p-7">
        <span className="pill">Objetivos y estadísticas</span>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] md:text-5xl">{relation.athlete.displayName}</h1>
        <p className="mt-3 max-w-3xl text-[color:var(--muted)]">
          Perfil, objetivo y récords personales. Esta información deja de ensuciar la portada de seguimiento.
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <aside className="panel p-5">
          <h2 className="text-2xl font-black">Perfil</h2>
          <div className="mt-4 grid gap-3 text-sm">
            <Info label="Objetivo" value={relation.athlete.objective} />
            <Info label="Deporte" value={relation.athlete.primarySport.toLowerCase()} />
            <Info label="Horas/semana" value={`${relation.athlete.weeklyHours} h`} />
            <Info label="Peso" value={relation.athlete.weightKg ? `${relation.athlete.weightKg} kg` : '—'} />
            <Info label="FC reposo" value={relation.athlete.restingHr ? `${relation.athlete.restingHr} ppm` : '—'} />
            <Info label="FTP" value={relation.athlete.ftp ? `${relation.athlete.ftp} W` : '—'} />
          </div>
        </aside>

        <section className="panel p-5">
          <h2 className="text-2xl font-black">Récords personales</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {records.map(record => (
              <article key={`${record.label}-${record.sport}`} className="rounded-3xl border border-[color:var(--line)] bg-white/75 p-4">
                <p className="text-sm font-black text-[color:var(--muted)]">{record.label}</p>
                <b className="text-3xl">{record.value}</b>
                <span className="pill mt-3">{record.sport.toLowerCase()}</span>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="grid gap-1 rounded-2xl bg-white/70 px-4 py-3"><span className="text-[color:var(--muted)]">{label}</span><b>{value}</b></div>;
}

function Guarded() {
  return (
    <main className="shell grid min-h-screen place-items-center py-8">
      <section className="panel w-full max-w-md p-6 md:p-8">
        <span className="pill">Acceso restringido</span>
        <h1 className="mt-4 text-3xl font-black tracking-[-0.04em]">Stats no disponibles</h1>
        <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">Solo un Mister verificado con relación activa puede consultar estos datos.</p>
      </section>
    </main>
  );
}
