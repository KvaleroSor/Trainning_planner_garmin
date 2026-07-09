import { AppHeader } from '@/components/app-header';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function TodayPage() {
  const athlete = await prisma.athleteProfile.findFirst({
    where: { user: { email: 'k@demo.local' } },
    include: { workouts: { orderBy: { date: 'asc' } } },
  });

  if (!athlete) {
    return <main className="shell py-6 md:py-10"><AppHeader eyebrow="Hoy" active="today" /><section className="panel p-6">Ejecuta <code>npm run db:seed</code>.</section></main>;
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const session = athlete.workouts.find(workout => workout.status === 'PLANNED' && workout.date >= now)
    ?? athlete.workouts.find(workout => workout.status === 'PLANNED')
    ?? athlete.workouts[0];

  const blocks = [
    { title: 'Objetivo', value: session ? session.notes ?? 'Completar la sesión con control y buenas sensaciones.' : 'Sin sesión programada.' },
    { title: 'Estructura', value: session ? 'Calentamiento suave · bloque principal · vuelta a la calma' : 'Día libre o pendiente de planificación.' },
    { title: 'Zonas', value: session ? `${session.intensity} · usa FC/RPE como referencia si no hay potencia/ritmo cargado` : '—' },
    { title: 'Feedback post-entreno', value: 'Registrar RPE, fatiga, sueño, dolor y comentario breve.' },
  ];

  return (
    <main className="shell py-6 md:py-10">
      <AppHeader eyebrow="Entrenamiento de hoy" active="today" />

      <section className="panel mb-5 p-5 md:p-7">
        <span className="pill">Sesión prioritaria</span>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] md:text-5xl">{session?.title ?? 'Sin entrenamiento hoy'}</h1>
        <p className="mt-3 max-w-3xl text-[color:var(--muted)]">
          {session
            ? `${session.date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })} · ${session.sport.toLowerCase()} · ${session.plannedMinutes} min`
            : 'Cuando haya una sesión planificada, aparecerá aquí nada más entrar.'}
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="grid gap-4">
          {blocks.map(block => (
            <article key={block.title} className="rounded-3xl border border-[color:var(--line)] bg-white/75 p-5 shadow-sm">
              <p className="text-sm font-black text-[color:var(--muted)]">{block.title}</p>
              <p className="mt-2 text-lg font-bold leading-7">{block.value}</p>
            </article>
          ))}
        </div>

        <aside className="panel p-5">
          <h2 className="text-2xl font-black">Resumen rápido</h2>
          <div className="mt-4 grid gap-3 text-sm">
            <Info label="Duración" value={session ? `${session.plannedMinutes} min` : '—'} />
            <Info label="Intensidad" value={session?.intensity ?? '—'} />
            <Info label="Estado" value={session?.status.toLowerCase() ?? '—'} />
            <Info label="Origen" value={session?.source.toLowerCase() ?? '—'} />
          </div>
        </aside>
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3"><span className="text-[color:var(--muted)]">{label}</span><b>{value}</b></div>;
}
