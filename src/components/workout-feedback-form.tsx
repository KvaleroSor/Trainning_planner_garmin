import type { WorkoutFeedback } from '@prisma/client';
import { submitWorkoutFeedbackAction } from '@/app/workouts/actions';

export function WorkoutFeedbackForm({ workoutId, feedback }: { workoutId: string; feedback?: WorkoutFeedback | null }) {
  return (
    <form action={submitWorkoutFeedbackAction} className="panel grid gap-4 p-5">
      <input type="hidden" name="workoutId" value={workoutId} />
      <input type="hidden" name="returnTo" value={`/workouts/${workoutId}`} />
      <div>
        <p className="eyebrow">Feedback del atleta</p>
        <h2 className="text-2xl font-black">Cómo fue realmente</h2>
        <p className="mt-1 text-sm text-[color:var(--muted)]">Solo el atleta puede enviar o editar esta sensación. El Mister la ve como señal de seguimiento.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-bold">
          RPE 1–10
          <input className="rounded-2xl border border-[color:var(--line)] bg-white px-4 py-3" name="perceivedEffort" type="number" min="1" max="10" defaultValue={feedback?.perceivedEffort ?? 5} required />
        </label>
        <label className="grid gap-1 text-sm font-bold">
          Sensación
          <select className="rounded-2xl border border-[color:var(--line)] bg-white px-4 py-3" name="mood" defaultValue={feedback?.mood ?? 'CONTROLADA'}>
            <option value="FUERTE">Fuerte</option>
            <option value="CONTROLADA">Controlada</option>
            <option value="SUAVE">Suave</option>
            <option value="PESADA">Pesada</option>
            <option value="DOLOR">Con dolor</option>
          </select>
        </label>
      </div>

      <label className="grid gap-1 text-sm font-bold">
        Molestias
        <input className="rounded-2xl border border-[color:var(--line)] bg-white px-4 py-3" name="painNote" placeholder="Opcional" defaultValue={feedback?.painNote ?? ''} />
      </label>

      <label className="grid gap-1 text-sm font-bold">
        Comentario
        <textarea className="min-h-28 rounded-2xl border border-[color:var(--line)] bg-white px-4 py-3" name="comment" placeholder="Cómo te sentiste, qué ajustarías, contexto de sueño/carga…" defaultValue={feedback?.comment ?? ''} />
      </label>

      <button className="btn-primary w-fit" type="submit">Guardar feedback</button>
    </form>
  );
}
