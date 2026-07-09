import { describe, expect, it } from 'vitest';
import { parseWorkoutFormData, parseWorkoutDeleteIntent } from './workout-input';

function form(entries: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(entries)) data.set(key, value);
  return data;
}

describe('workout form parsing', () => {
  it('normalizes a valid workout create payload', () => {
    const parsed = parseWorkoutFormData(form({
      title: '  Rodaje suave  ',
      sport: 'RUNNING',
      date: '2026-08-12',
      plannedMinutes: '45',
      intensity: 'Z2',
      notes: 'Sin perseguir héroes.',
    }));

    expect(parsed).toEqual({
      title: 'Rodaje suave',
      sport: 'RUNNING',
      date: new Date('2026-08-12T08:00:00.000Z'),
      plannedMinutes: 45,
      intensity: 'Z2',
      notes: 'Sin perseguir héroes.',
    });
  });

  it('rejects negative or zero durations before Prisma writes', () => {
    expect(() => parseWorkoutFormData(form({
      title: 'Bug con zapatillas',
      sport: 'RUNNING',
      date: '2026-08-12',
      plannedMinutes: '-50',
      intensity: 'Z2',
    }))).toThrow('La duración debe estar entre 1 y 1440 minutos.');
  });

  it('requires explicit delete confirmation text', () => {
    expect(parseWorkoutDeleteIntent(form({ confirmDelete: 'BORRAR' }))).toEqual({ confirmed: true });
    expect(() => parseWorkoutDeleteIntent(form({ confirmDelete: 'borrar' }))).toThrow('Escribe BORRAR para confirmar.');
  });
});
