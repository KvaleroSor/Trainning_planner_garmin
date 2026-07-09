import Link from 'next/link';
import { AppHeader } from '@/components/app-header';
import { WorkoutFeedbackForm } from '@/components/workout-feedback-form';
import { WorkoutManagePanel } from '@/components/workout-forms';
import { requireWorkoutReadAccess } from '@/lib/workout-access';

type WorkoutDetailPageProps = {
  params: Promise<{ id: string }>;
};

function formatDate(date: Date) {
  return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export default async function WorkoutDetailPage({ params }: WorkoutDetailPageProps) {
  const { id } = await params;
  const { workout, accessRole } = await requireWorkoutReadAccess(id);
  const feedback = workout.feedbacks[0] ?? null;
  const analysis = workout.analyses[0] ?? null;

  return (
    <main className="shell pb-12 pt-6">
      <AppHeader active="calendar" eyebrow="Detalle" />

      <section className="hero-card mb-6 grid gap-6 p-6 lg:grid-cols-[1.4fr_0.8fr]">
        <div>
          <p className="eyebrow">{workout.sport.toLowerCase()} · {workout.status.toLowerCase()}</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.04em] md:text-6xl">{workout.title}</h1>
          <p className="mt-4 max-w-2xl text-lg text-[color:var(--muted)]">{formatDate(workout.date)} · {workout.plannedMinutes} min planificados · intensidad {workout.intensity}</p>
          {workout.notes ? <p className="mt-4 rounded-3xl bg-white/70 p-4 text-sm font-semibold text-[color:var(--muted)]">{workout.notes}</p> : null}
        </div>
        <div className="rounded-[2rem] bg-white/75 p-5 shadow-soft">
          <p className="eyebrow">Trazabilidad</p>
          <dl className="mt-4 grid gap-3 text-sm">
            <div className="flex justify-between gap-4"><dt className="text-[color:var(--muted)]">Fuente</dt><dd className="font-black">{workout.source}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-[color:var(--muted)]">Creado por</dt><dd className="text-right font-black">{workout.createdBy?.name ?? workout.createdBy?.email ?? 'Sistema'}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-[color:var(--muted)]">Última edición</dt><dd className="text-right font-black">{workout.updatedBy?.name ?? workout.updatedBy?.email ?? 'Sistema'}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-[color:var(--muted)]">Atleta</dt><dd className="text-right font-black">{workout.athlete.displayName}</dd></div>
          </dl>
        </div>
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-3">
        <article className="panel p-5">
          <p className="eyebrow">Plan</p>
          <h2 className="mt-2 text-2xl font-black">{workout.plannedMinutes} min</h2>
          <p className="mt-2 text-sm text-[color:var(--muted)]">Objetivo de carga: {workout.intensity}</p>
        </article>
        <article className="panel p-5">
          <p className="eyebrow">Real</p>
          <h2 className="mt-2 text-2xl font-black">{workout.actualMinutes ?? workout.garminActivity?.durationMinutes ?? '—'} min</h2>
          <p className="mt-2 text-sm text-[color:var(--muted)]">{workout.garminActivity ? 'Actividad Garmin vinculada' : 'Pendiente de ejecución/importación'}</p>
        </article>
        <article className="panel p-5">
          <p className="eyebrow">Feedback</p>
          <h2 className="mt-2 text-2xl font-black">{feedback ? `RPE ${feedback.perceivedEffort}/10` : 'Pendiente'}</h2>
          <p className="mt-2 text-sm text-[color:var(--muted)]">{feedback?.mood ?? 'Sin sensación registrada todavía'}</p>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="grid gap-6">
          {accessRole === 'athlete' ? <WorkoutFeedbackForm workoutId={workout.id} feedback={feedback} /> : null}

          <article className="panel p-5">
            <p className="eyebrow">Gestión</p>
            <h2 className="mt-2 text-2xl font-black">Acciones protegidas</h2>
            <div className="mt-4">
              <WorkoutManagePanel workout={workout} returnTo={`/workouts/${workout.id}`} />
            </div>
          </article>
        </div>

        <aside className="grid gap-4">
          {feedback ? (
            <article className="panel p-5">
              <p className="eyebrow">Lectura del atleta</p>
              <h2 className="mt-2 text-2xl font-black">{feedback.mood}</h2>
              {feedback.painNote ? <p className="mt-3 rounded-2xl bg-[color:var(--rose)]/50 p-3 text-sm font-bold">Molestia: {feedback.painNote}</p> : null}
              {feedback.comment ? <p className="mt-3 text-sm text-[color:var(--muted)]">{feedback.comment}</p> : null}
            </article>
          ) : null}

          {workout.garminActivity ? (
            <article className="panel p-5">
              <p className="eyebrow">Garmin</p>
              <h2 className="mt-2 text-2xl font-black">{workout.garminActivity.durationMinutes} min</h2>
              <p className="mt-2 text-sm text-[color:var(--muted)]">FC media {workout.garminActivity.avgHr ?? '—'} · Potencia {workout.garminActivity.avgPower ?? '—'}</p>
            </article>
          ) : null}

          {analysis ? (
            <article className="panel p-5">
              <p className="eyebrow">Análisis</p>
              <h2 className="mt-2 text-2xl font-black">{analysis.compliance}%</h2>
              <p className="mt-2 text-sm text-[color:var(--muted)]">{analysis.coachCopy}</p>
            </article>
          ) : null}

          <Link className="btn-ghost text-center" href={`/calendar?month=${workout.date.toISOString().slice(0, 7)}`}>← Volver al calendario</Link>
        </aside>
      </section>
    </main>
  );
}
