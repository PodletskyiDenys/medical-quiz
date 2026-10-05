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

// ---------------------------------------------------------------------------
// Тест з варіантами: 1 правильна відповідь + 3 хибні, узяті з ІНШИХ питань.
// Нічого не вигадується: хибні варіанти - це реальні правильні відповіді інших питань.
// ---------------------------------------------------------------------------

export type QuizType = 'choice' | 'self';
export const DEFAULT_TYPE: QuizType = 'choice';
export const parseType = (v: string | null): QuizType => (v === 'self' ? 'self' : DEFAULT_TYPE);

export interface Choices {
  options: string[];
  correctIndex: number;
}

const OPTION_COUNT = 4;
const norm = (s: string) => s.toLowerCase().replace(/[\s.,;:!?"'«»()]+/g, ' ').trim();
const NUMERIC = /^[-+−]?\d+([.,]\d+)?$/;
// Ключ «того самого питання» з урахуванням дрібних відмінностей запису:
// пробіли/дужки/пунктуація, латинська I замість української І, закінчення слів («ферум»/«феруму»).
// Однакові за ключем питання часто мають різні, але теж ПРАВИЛЬНІ відповіді - їх не можна давати як хибні.
const keyCache = new WeakMap<Question, string>();
function sameQuestionKey(q: Question): string {
  const hit = keyCache.get(q);
  if (hit) return hit;
  const key = (q.question.toLowerCase().replace(/[iі]/g, 'і').match(/[a-zа-щьюяіїєґ0-9]+/g) ?? []).map((w) => w.slice(0, 5)).join(' ');
  keyCache.set(q, key);
  return key;
}
const answerText = (q: Question) => q.answers.join('; ');
const isNumeric = (q: Question) => q.answers.every((a) => NUMERIC.test(a.trim()));

// «Форма» відповіді: число / формула / слово / фраза - хибні варіанти добираємо тієї ж форми
type Shape = 'num' | 'formula' | 'word' | 'phrase';
const shapeCache = new WeakMap<Question, Shape>();
function shapeOf(q: Question): Shape {
  const hit = shapeCache.get(q);
  if (hit) return hit;
  const a = q.answers[0].trim();
  const shape: Shape = isNumeric(q)
    ? 'num'
    : /\s/.test(a)
      ? 'phrase'
      : /[0-9]|[A-Z][a-z]?[A-Z0-9(\[]/.test(a) && /[A-Za-z]/.test(a)
        ? 'formula'
        : 'word';
  shapeCache.set(q, shape);
  return shape;
}

// Тематична схожість питань: спільні слова (за основою слова, ≥4 літер)
const tokenCache = new WeakMap<Question, Set<string>>();
function tokensOf(q: Question): Set<string> {
  const hit = tokenCache.get(q);
  if (hit) return hit;
  const set = new Set((q.question.toLowerCase().match(/[a-zа-щьюяіїєґ]{4,}/gi) ?? []).map((w) => w.slice(0, 5)));
  tokenCache.set(q, set);
  return set;
}
function similarity(a: Question, b: Question): number {
  const ta = tokensOf(a), tb = tokensOf(b);
  if (!ta.size || !tb.size) return 0;
  let common = 0;
  ta.forEach((t) => { if (tb.has(t)) common++; });
  return common / Math.min(ta.size, tb.size); // 0..1
}

/**
 * Добирає 3 найбільш «схожі» хибні варіанти (того ж типу - число/текст,
 * тієї ж кількості відповідей, близької довжини), щоб правильну відповідь
 * не можна було вгадати за формою. Серед схожих вибір випадковий.
 */
export function buildChoices(q: Question, pool: readonly Question[], fallbackPool: readonly Question[] = []): Choices {
  const correct = answerText(q);
  const forbidden = new Set<string>([norm(correct), ...q.answers.map(norm)]);
  const sameKey = sameQuestionKey(q);
  // відповіді всіх повторних формулювань цього питання теж правильні - їх не можна показувати як хибні
  for (const p of [...pool, ...fallbackPool]) {
    if (p.id !== q.id && sameQuestionKey(p) === sameKey) p.answers.forEach((a) => forbidden.add(norm(a)));
  }
  const shape = shapeOf(q);

  const collect = (source: readonly Question[]) => {
    const seen = new Set<string>(forbidden);
    const out: { text: string; score: number }[] = [];
    for (const p of source) {
      if (p.id === q.id || sameQuestionKey(p) === sameKey) continue; // те саме питання з іншою відповіддю може бути теж правильним
      const text = answerText(p);
      const key = norm(text);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      const score =
        Math.abs(text.length - correct.length) / Math.max(correct.length, 8) +
        (shapeOf(p) === shape ? 0 : shape === 'num' || shapeOf(p) === 'num' ? 4 : 1.5) +
        Math.abs(p.answers.length - q.answers.length) * 1.5 +
        (1 - similarity(q, p)) * 2.5; // чим ближча тема питання, тим правдоподібніший варіант
      out.push({ text, score });
    }
    return out;
  };

  let candidates = collect(pool);
  if (candidates.length < OPTION_COUNT - 1) {
    const have = new Set(candidates.map((c) => norm(c.text)));
    candidates = candidates.concat(collect(fallbackPool).filter((c) => !have.has(norm(c.text))));
  }
  candidates.sort((a, b) => a.score - b.score);
  const best = shuffle(candidates.slice(0, 10)).slice(0, OPTION_COUNT - 1).map((c) => c.text);

  const options = shuffle([correct, ...best]);
  return { options, correctIndex: options.indexOf(correct) };
}
