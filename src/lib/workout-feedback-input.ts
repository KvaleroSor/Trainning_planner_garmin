import { z } from 'zod';

const feedbackInputSchema = z.object({
  perceivedEffort: z.coerce.number().int().min(1, 'El esfuerzo percibido debe estar entre 1 y 10.').max(10, 'El esfuerzo percibido debe estar entre 1 y 10.'),
  mood: z.string().trim().min(2, 'La sensación es obligatoria.').max(40),
  painNote: z.string().trim().max(300).optional().transform(value => value || null),
  comment: z.string().trim().max(800).optional().transform(value => value || null),
});

export type ParsedWorkoutFeedbackInput = {
  perceivedEffort: number;
  mood: string;
  painNote: string | null;
  comment: string | null;
};

function getString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

function getErrorMessage(error: unknown): string {
  if (error instanceof z.ZodError) return error.issues[0]?.message ?? 'Feedback inválido.';
  if (error instanceof Error) return error.message;
  return 'Feedback inválido.';
}

export function parseWorkoutFeedbackFormData(formData: FormData): ParsedWorkoutFeedbackInput {
  const result = feedbackInputSchema.safeParse({
    perceivedEffort: getString(formData, 'perceivedEffort'),
    mood: getString(formData, 'mood'),
    painNote: getString(formData, 'painNote'),
    comment: getString(formData, 'comment'),
  });

  if (!result.success) throw new Error(getErrorMessage(result.error));

  return result.data;
}
