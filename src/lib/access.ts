import 'server-only';

import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from './auth';
import { prisma } from './prisma';

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  return prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      athleteProfile: true,
      coachProfile: true,
    },
  });
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return user;
}

export async function requireAthleteProfile() {
  const user = await requireCurrentUser();
  if (!user.athleteProfile) redirect('/login?error=athlete-profile-required');
  return { user, athlete: user.athleteProfile };
}

export async function requireVerifiedCoach() {
  const user = await requireCurrentUser();
  if (user.role !== 'COACH_VERIFIED' || user.coachProfile?.status !== 'VERIFIED') {
    redirect('/login?error=verified-coach-required');
  }
  return { user, coach: user.coachProfile };
}

export async function requireActiveCoachAthleteRelation(athleteId: string) {
  const { coach } = await requireVerifiedCoach();
  const relation = await prisma.coachAthleteRelation.findFirst({
    where: {
      coachId: coach.id,
      athleteId,
      status: 'ACTIVE',
    },
  });

  if (!relation) notFound();

  return { coach, relation };
}
