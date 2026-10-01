import type { Question } from '../types/questions';
import { shuffle } from './shuffle';

export type QuizCount = 10 | 20 | 30 | 'all';
export const DEFAULT_COUNT: QuizCount = 20;

/** Випадкова вибірка питань. Хибних варіантів у даних немає, тому перемішуються лише питання. */
export function buildQuiz(questions: readonly Question[], count: QuizCount): Question[] {
  const mixed = shuffle(questions);
  return count === 'all' ? mixed : mixed.slice(0, Math.min(count, mixed.length));
}

export const percentOf = (correct: number, total: number) => (total ? Math.round((correct / total) * 100) : 0);

export function parseCount(value: string | null): QuizCount {
  if (value === 'all') return 'all';
  const n = Number(value);
  return n === 10 || n === 20 || n === 30 ? n : DEFAULT_COUNT;
}
