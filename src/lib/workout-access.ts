import 'server-only';

import { notFound } from 'next/navigation';
import { requireCurrentUser } from '@/lib/access';
import { prisma } from '@/lib/prisma';

export async function requireWorkoutReadAccess(workoutId: string) {
  const user = await requireCurrentUser();
  const workout = await prisma.workout.findUnique({
    where: { id: workoutId },
    include: {
      athlete: { include: { user: true } },
      garminActivity: true,
      analyses: { orderBy: { createdAt: 'desc' } },
      feedbacks: { orderBy: { updatedAt: 'desc' } },
      createdBy: { select: { name: true, email: true } },
      updatedBy: { select: { name: true, email: true } },
    },
  });

  if (!workout) notFound();

  if (user.athleteProfile?.id === workout.athleteId) {
    return { user, workout, accessRole: 'athlete' as const };
  }

  if (user.role === 'COACH_VERIFIED' && user.coachProfile?.status === 'VERIFIED') {
    const relation = await prisma.coachAthleteRelation.findFirst({
      where: { athleteId: workout.athleteId, coachId: user.coachProfile.id, status: 'ACTIVE' },
    });
    if (relation) return { user, workout, accessRole: 'coach' as const };
  }

  notFound();
}

export async function requireWorkoutWriteAccess(athleteId: string) {
  const user = await requireCurrentUser();

  if (user.athleteProfile?.id === athleteId) {
    return { user, actorId: user.id, accessRole: 'athlete' as const };
  }

  if (user.role === 'COACH_VERIFIED' && user.coachProfile?.status === 'VERIFIED') {
    const relation = await prisma.coachAthleteRelation.findFirst({
      where: { athleteId, coachId: user.coachProfile.id, status: 'ACTIVE' },
    });
    if (relation) return { user, actorId: user.id, accessRole: 'coach' as const };
  }

  throw new Error('No tienes permisos para modificar entrenamientos de este atleta.');
}
