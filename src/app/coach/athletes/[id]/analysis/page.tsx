import { AppHeader } from '@/components/app-header';
import { AthleteSubnav } from '@/components/athlete-subnav';
import { requireActiveCoachAthleteRelation } from '@/lib/access';
import { analyzePlanVsActual } from '@/lib/domain';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

type AthleteAnalysisPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AthleteAnalysisPage({ params }: AthleteAnalysisPageProps) {
  const { id } = await params;
  const { relation: allowedRelation } = await requireActiveCoachAthleteRelation(id);

  const relation = await prisma.coachAthleteRelation.findUnique({
    where: { id: allowedRelation.id },
    include: {
      athlete: {
        include: {
          garminActivities: { include: { workout: true }, orderBy: { startedAt: 'desc' } },
        },
      },
    },
  });

  if (!relation) {
    return <Guarded />;
  }

  const analyses = relation.athlete.garminActivities
    .filter(activity => activity.workout)
    .map(activity => analyzePlanVsActual({
      title: activity.workout?.title ?? 'Actividad Garmin',
      plannedMinutes: activity.workout?.plannedMinutes ?? activity.durationMinutes,
      actualMinutes: activity.durationMinutes,
      avgHr: activity.avgHr,
      avgPower: activity.avgPower,
      distanceMeters: activity.distanceMeters,
    }));

  return (
    <main className="shell py-6 md:py-10">
      <AppHeader eyebrow="Análisis atleta" active="coach" />
      <AthleteSubnav athleteId={id} active="analysis" />

      <section className="panel mb-5 p-5 md:p-7">
        <span className="pill">Planificado vs realizado</span>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] md:text-5xl">{relation.athlete.displayName}</h1>
        <p className="mt-3 max-w-3xl text-[color:var(--muted)]">
          Lectura de sesiones Garmin enlazadas con lo planificado. Aquí está el valor que pidió el mister: ver qué se ejecutó realmente.
        </p>
      </section>

      <section className="grid gap-4">
        {analyses.map(analysis => (
          <article key={`${analysis.title}-${analysis.actualMinutes}`} className="panel p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span className="pill">{analysis.signal === 'over' ? 'Por encima' : analysis.signal === 'under' ? 'Por debajo' : 'En rango'}</span>
                <h2 className="mt-3 text-3xl font-black">{analysis.title}</h2>
              </div>
              <div className="rounded-3xl bg-[color:var(--butter)] px-5 py-4 text-center">
                <p className="text-xs font-black text-[color:var(--muted)]">Cumplimiento</p>
                <b className="text-3xl">{analysis.compliance}%</b>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <Metric label="Plan" value={`${analysis.plannedMinutes} min`} />
              <Metric label="Real" value={`${analysis.actualMinutes} min`} />
              <Metric label="Diferencia" value={`${analysis.deltaMinutes > 0 ? '+' : ''}${analysis.deltaMinutes} min`} />
            </div>

            <p className="mt-5 rounded-3xl bg-white/70 p-4 font-bold leading-7">{analysis.coachCopy}</p>
            {analysis.metrics.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {analysis.metrics.map(metric => <span key={metric} className="pill">{metric}</span>)}
              </div>
            )}
          </article>
        ))}
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-3xl border border-[color:var(--line)] bg-white/75 p-4"><p className="text-sm font-black text-[color:var(--muted)]">{label}</p><b className="text-2xl">{value}</b></div>;
}

function Guarded() {
  return (
    <main className="shell grid min-h-screen place-items-center py-8">
      <section className="panel w-full max-w-md p-6 md:p-8">
        <span className="pill">Acceso restringido</span>
        <h1 className="mt-4 text-3xl font-black tracking-[-0.04em]">Análisis no disponible</h1>
        <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">Solo un Mister verificado con relación activa puede consultar este análisis.</p>
      </section>
    </main>
  );
}
