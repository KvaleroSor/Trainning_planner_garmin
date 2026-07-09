'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { parseWorkoutFeedbackFormData } from '@/lib/workout-feedback-input';
import { requireWorkoutWriteAccess } from '@/lib/workout-access';
import { prisma } from '@/lib/prisma';
import { parseWorkoutDeleteIntent, parseWorkoutFormData } from '@/lib/workout-input';
import type { WorkoutStatus } from '@prisma/client';

function revalidateWorkoutSurfaces(athleteId: string) {
  revalidatePath('/dashboard');
  revalidatePath('/today');
  revalidatePath('/calendar');
  revalidatePath('/coach');
  revalidatePath(`/coach/athletes/${athleteId}`);
  revalidatePath(`/coach/athletes/${athleteId}/analysis`);
  revalidatePath(`/coach/athletes/${athleteId}/stats`);
  revalidatePath('/workouts');
}

function redirectBack(formData: FormData, fallback: string): never {
  const returnTo = formData.get('returnTo');
  redirect((typeof returnTo === 'string' && returnTo.startsWith('/') ? returnTo : fallback) as never);
}

export async function createWorkoutAction(formData: FormData) {
  const athleteId = formData.get('athleteId');
  if (typeof athleteId !== 'string' || !athleteId) throw new Error('Atleta inválido.');

  const { actorId } = await requireWorkoutWriteAccess(athleteId);
  const input = parseWorkoutFormData(formData);

  const workout = await prisma.workout.create({
    data: {
      athleteId,
      ...input,
      status: 'PLANNED',
      source: 'MANUAL',
      createdById: actorId,
      updatedById: actorId,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId,
      action: 'WORKOUT_CREATED',
      targetId: workout.id,
      metadata: { athleteId, title: workout.title, date: workout.date.toISOString() },
    },
  });

  revalidateWorkoutSurfaces(athleteId);
  redirectBack(formData, `/calendar?month=${input.date.toISOString().slice(0, 7)}`);
}

export async function updateWorkoutAction(formData: FormData) {
  const workoutId = formData.get('workoutId');
  if (typeof workoutId !== 'string' || !workoutId) throw new Error('Entrenamiento inválido.');

  const existing = await prisma.workout.findUnique({ where: { id: workoutId } });
  if (!existing) throw new Error('Entrenamiento no encontrado.');
  if (existing.source === 'GARMIN') throw new Error('No se editan actividades Garmin importadas desde el plan manual.');

  const { actorId } = await requireWorkoutWriteAccess(existing.athleteId);
  const input = parseWorkoutFormData(formData);

  const workout = await prisma.workout.update({
    where: { id: workoutId },
    data: {
      ...input,
      updatedById: actorId,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId,
      action: 'WORKOUT_UPDATED',
      targetId: workout.id,
      metadata: { athleteId: workout.athleteId, title: workout.title, date: workout.date.toISOString() },
    },
  });

  revalidateWorkoutSurfaces(workout.athleteId);
  redirectBack(formData, `/calendar?month=${input.date.toISOString().slice(0, 7)}`);
}

export async function updateWorkoutStatusAction(formData: FormData) {
  const workoutId = formData.get('workoutId');
  const status = formData.get('status');
  if (typeof workoutId !== 'string' || !workoutId) throw new Error('Entrenamiento inválido.');
  if (status !== 'COMPLETED' && status !== 'SKIPPED' && status !== 'PLANNED') throw new Error('Estado inválido.');

  const existing = await prisma.workout.findUnique({ where: { id: workoutId } });
  if (!existing) throw new Error('Entrenamiento no encontrado.');
  if (existing.source === 'GARMIN') throw new Error('No se cambia el estado de actividades Garmin importadas.');

  const { actorId } = await requireWorkoutWriteAccess(existing.athleteId);
  const nextStatus = status as WorkoutStatus;
  const workout = await prisma.workout.update({
    where: { id: workoutId },
    data: {
      status: nextStatus,
      actualMinutes: nextStatus === 'COMPLETED' ? existing.actualMinutes ?? existing.plannedMinutes : existing.actualMinutes,
      updatedById: actorId,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId,
      action: 'WORKOUT_UPDATED',
      targetId: workout.id,
      metadata: { athleteId: workout.athleteId, status: nextStatus },
    },
  });

  revalidateWorkoutSurfaces(workout.athleteId);
  redirectBack(formData, `/calendar?month=${workout.date.toISOString().slice(0, 7)}`);
}

export async function deleteWorkoutAction(formData: FormData) {
  parseWorkoutDeleteIntent(formData);

  const workoutId = formData.get('workoutId');
  if (typeof workoutId !== 'string' || !workoutId) throw new Error('Entrenamiento inválido.');

  const existing = await prisma.workout.findUnique({ where: { id: workoutId } });
  if (!existing) throw new Error('Entrenamiento no encontrado.');
  if (existing.source === 'GARMIN' || existing.status === 'IMPORTED') {
    throw new Error('No se borran actividades Garmin/importadas desde esta acción.');
  }

  const { actorId } = await requireWorkoutWriteAccess(existing.athleteId);
  await prisma.workout.delete({ where: { id: workoutId } });
  await prisma.auditLog.create({
    data: {
      actorId,
      action: 'WORKOUT_DELETED',
      targetId: workoutId,
      metadata: { athleteId: existing.athleteId, title: existing.title, date: existing.date.toISOString() },
    },
  });

  revalidateWorkoutSurfaces(existing.athleteId);
  revalidatePath(`/workouts/${workoutId}`);
  redirectBack(formData, `/calendar?month=${existing.date.toISOString().slice(0, 7)}`);
}

export async function submitWorkoutFeedbackAction(formData: FormData) {
  const workoutId = formData.get('workoutId');
  if (typeof workoutId !== 'string' || !workoutId) throw new Error('Entrenamiento inválido.');

  const existing = await prisma.workout.findUnique({ where: { id: workoutId } });
  if (!existing) throw new Error('Entrenamiento no encontrado.');

  const { user, actorId, accessRole } = await requireWorkoutWriteAccess(existing.athleteId);
  if (accessRole !== 'athlete' || user.athleteProfile?.id !== existing.athleteId) {
    throw new Error('Solo el atleta puede enviar su propio feedback.');
  }

  const input = parseWorkoutFeedbackFormData(formData);
  const feedback = await prisma.workoutFeedback.upsert({
    where: { workoutId_athleteId: { workoutId, athleteId: existing.athleteId } },
    create: { workoutId, athleteId: existing.athleteId, ...input },
    update: input,
  });

  await prisma.auditLog.create({
    data: {
      actorId,
      action: 'WORKOUT_FEEDBACK_SUBMITTED',
      targetId: workoutId,
      metadata: { athleteId: existing.athleteId, perceivedEffort: feedback.perceivedEffort, mood: feedback.mood },
    },
  });

  revalidateWorkoutSurfaces(existing.athleteId);
  revalidatePath(`/workouts/${workoutId}`);
  redirectBack(formData, `/workouts/${workoutId}`);
}
