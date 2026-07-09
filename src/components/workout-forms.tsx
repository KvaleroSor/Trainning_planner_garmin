import type { SportType, Workout, WorkoutStatus } from '@prisma/client';
import {
  createWorkoutAction,
  deleteWorkoutAction,
  updateWorkoutAction,
  updateWorkoutStatusAction,
} from '@/app/workouts/actions';

const sportOptions: Array<{ value: SportType; label: string }> = [
  { value: 'CYCLING', label: 'Bici' },
  { value: 'RUNNING', label: 'Carrera' },
  { value: 'SWIMMING', label: 'Natación' },
  { value: 'STRENGTH', label: 'Fuerza' },
  { value: 'TRIATHLON', label: 'Triatlón' },
  { value: 'MOBILITY', label: 'Movilidad' },
];

function dateValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function WorkoutCreateForm({ athleteId, defaultDate, returnTo }: { athleteId: string; defaultDate: string; returnTo: string }) {
  return (
    <form action={createWorkoutAction} className="panel grid gap-4 p-5 md:grid-cols-[1fr_160px_160px_130px] md:items-end">
      <input type="hidden" name="athleteId" value={athleteId} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <label className="grid gap-2 text-sm font-bold md:col-span-1">
        Nuevo entrenamiento
        <input required minLength={2} maxLength={80} className="rounded-2xl border border-[color:var(--line)] bg-white/80 px-4 py-3" name="title" placeholder="Rodaje Z2" />
      </label>
      <label className="grid gap-2 text-sm font-bold">
        Fecha
        <input required className="rounded-2xl border border-[color:var(--line)] bg-white/80 px-4 py-3" name="date" type="date" defaultValue={defaultDate} />
      </label>
      <label className="grid gap-2 text-sm font-bold">
        Deporte
        <select className="rounded-2xl border border-[color:var(--line)] bg-white/80 px-4 py-3" name="sport" defaultValue="RUNNING">
          {sportOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </label>
      <label className="grid gap-2 text-sm font-bold">
        Min
        <input required min={1} max={1440} className="rounded-2xl border border-[color:var(--line)] bg-white/80 px-4 py-3" name="plannedMinutes" type="number" defaultValue={45} />
      </label>
      <label className="grid gap-2 text-sm font-bold md:col-span-2">
        Intensidad
        <input required maxLength={40} className="rounded-2xl border border-[color:var(--line)] bg-white/80 px-4 py-3" name="intensity" defaultValue="Z2" />
      </label>
      <label className="grid gap-2 text-sm font-bold md:col-span-2">
        Notas
        <input maxLength={500} className="rounded-2xl border border-[color:var(--line)] bg-white/80 px-4 py-3" name="notes" placeholder="Objetivo, técnica, avisos…" />
      </label>
      <button className="btn btn-primary md:col-span-4" type="submit">Crear entrenamiento</button>
    </form>
  );
}

export function WorkoutManagePanel({ workout, returnTo }: { workout: Workout; returnTo: string }) {
  const locked = workout.source === 'GARMIN' || workout.status === 'IMPORTED';
  return (
    <details className="rounded-2xl bg-white/70 p-3 text-sm">
      <summary className="cursor-pointer font-black">Gestionar</summary>
      <div className="mt-3 grid gap-3">
        {!locked && <WorkoutEditForm workout={workout} returnTo={returnTo} />}
        {!locked && <WorkoutStatusForms workoutId={workout.id} returnTo={returnTo} />}
        {!locked ? <WorkoutDeleteForm workoutId={workout.id} returnTo={returnTo} /> : <p className="text-xs text-[color:var(--muted)]">Actividad importada protegida: no se edita ni borra desde planificación manual.</p>}
      </div>
    </details>
  );
}

function WorkoutEditForm({ workout, returnTo }: { workout: Workout; returnTo: string }) {
  return (
    <form action={updateWorkoutAction} className="grid gap-2">
      <input type="hidden" name="workoutId" value={workout.id} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <input required minLength={2} maxLength={80} className="rounded-xl border border-[color:var(--line)] bg-white px-3 py-2" name="title" defaultValue={workout.title} />
      <div className="grid grid-cols-2 gap-2">
        <input required className="rounded-xl border border-[color:var(--line)] bg-white px-3 py-2" name="date" type="date" defaultValue={dateValue(workout.date)} />
        <input required min={1} max={1440} className="rounded-xl border border-[color:var(--line)] bg-white px-3 py-2" name="plannedMinutes" type="number" defaultValue={workout.plannedMinutes} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <select className="rounded-xl border border-[color:var(--line)] bg-white px-3 py-2" name="sport" defaultValue={workout.sport}>
          {sportOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <input required maxLength={40} className="rounded-xl border border-[color:var(--line)] bg-white px-3 py-2" name="intensity" defaultValue={workout.intensity} />
      </div>
      <input maxLength={500} className="rounded-xl border border-[color:var(--line)] bg-white px-3 py-2" name="notes" defaultValue={workout.notes ?? ''} placeholder="Notas" />
      <button className="btn" type="submit">Guardar cambios</button>
    </form>
  );
}

function WorkoutStatusForms({ workoutId, returnTo }: { workoutId: string; returnTo: string }) {
  const statuses: Array<{ status: WorkoutStatus; label: string }> = [
    { status: 'COMPLETED', label: 'Completar' },
    { status: 'SKIPPED', label: 'Saltar' },
    { status: 'PLANNED', label: 'Replanificar' },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {statuses.map(item => (
        <form key={item.status} action={updateWorkoutStatusAction}>
          <input type="hidden" name="workoutId" value={workoutId} />
          <input type="hidden" name="status" value={item.status} />
          <input type="hidden" name="returnTo" value={returnTo} />
          <button className="btn" type="submit">{item.label}</button>
        </form>
      ))}
    </div>
  );
}

function WorkoutDeleteForm({ workoutId, returnTo }: { workoutId: string; returnTo: string }) {
  return (
    <form action={deleteWorkoutAction} className="grid gap-2 rounded-2xl bg-[color:var(--rose)]/40 p-3">
      <input type="hidden" name="workoutId" value={workoutId} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <label className="grid gap-1 text-xs font-bold">
        Confirmar borrado: escribe BORRAR
        <input className="rounded-xl border border-[color:var(--line)] bg-white px-3 py-2" name="confirmDelete" placeholder="BORRAR" />
      </label>
      <button className="btn" type="submit">Borrar entrenamiento</button>
    </form>
  );
}
