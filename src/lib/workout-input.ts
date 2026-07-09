import { z } from 'zod';

const sportSchema = z.enum(['CYCLING', 'RUNNING', 'SWIMMING', 'STRENGTH', 'TRIATHLON', 'MOBILITY']);

const workoutInputSchema = z.object({
  title: z.string().trim().min(2, 'El título debe tener al menos 2 caracteres.').max(80),
  sport: sportSchema,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida.'),
  plannedMinutes: z.coerce.number().int().min(1, 'La duración debe estar entre 1 y 1440 minutos.').max(1440, 'La duración debe estar entre 1 y 1440 minutos.'),
  intensity: z.string().trim().min(1, 'La intensidad es obligatoria.').max(40),
  notes: z.string().trim().max(500).optional().transform(value => value || null),
});

export type ParsedWorkoutInput = {
  title: string;
  sport: z.infer<typeof sportSchema>;
  date: Date;
  plannedMinutes: number;
  intensity: string;
  notes: string | null;
};

function getString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

function getErrorMessage(error: unknown): string {
  if (error instanceof z.ZodError) return error.issues[0]?.message ?? 'Formulario inválido.';
  if (error instanceof Error) return error.message;
  return 'Formulario inválido.';
}

export function parseWorkoutFormData(formData: FormData): ParsedWorkoutInput {
  const result = workoutInputSchema.safeParse({
    title: getString(formData, 'title'),
    sport: getString(formData, 'sport'),
    date: getString(formData, 'date'),
    plannedMinutes: getString(formData, 'plannedMinutes'),
    intensity: getString(formData, 'intensity'),
    notes: getString(formData, 'notes'),
  });

  if (!result.success) throw new Error(getErrorMessage(result.error));

  return {
    ...result.data,
    date: new Date(`${result.data.date}T08:00:00.000Z`),
  };
}

export function parseWorkoutDeleteIntent(formData: FormData): { confirmed: true } {
  if (getString(formData, 'confirmDelete') !== 'BORRAR') {
    throw new Error('Escribe BORRAR para confirmar.');
  }

  return { confirmed: true };
}
