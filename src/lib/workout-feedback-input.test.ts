import { describe, expect, it } from 'vitest';
import { parseWorkoutFeedbackFormData } from './workout-feedback-input';

function form(entries: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(entries)) data.set(key, value);
  return data;
}

describe('parseWorkoutFeedbackFormData', () => {
  it('normalizes valid athlete feedback', () => {
    expect(parseWorkoutFeedbackFormData(form({
      perceivedEffort: '7',
      mood: 'FUERTE',
      painNote: 'Molestia leve en gemelo',
      comment: 'Buena sesión, controlada.',
    }))).toEqual({
      perceivedEffort: 7,
      mood: 'FUERTE',
      painNote: 'Molestia leve en gemelo',
      comment: 'Buena sesión, controlada.',
    });
  });

  it('rejects unsafe ranges and trims optional empty text', () => {
    expect(() => parseWorkoutFeedbackFormData(form({ perceivedEffort: '11', mood: 'OK' }))).toThrow('El esfuerzo percibido debe estar entre 1 y 10.');

    expect(parseWorkoutFeedbackFormData(form({
      perceivedEffort: '3',
      mood: 'SUAVE',
      painNote: '   ',
      comment: '',
    }))).toMatchObject({ painNote: null, comment: null });
  });
});
