import type { Store, TopicProgress } from '../types/questions';

const KEY = 'medical-quiz:v1';

export const emptyTopicProgress = (): TopicProgress => ({
  currentQuestion: 0,
  completed: [],
  testHistory: [],
  incorrectQuestions: [],
});

export const emptyStore = (): Store => ({ version: 1, lastVisited: null, lastResult: null, topics: {} });

export function loadStore(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as Store;
    if (parsed?.version !== 1 || typeof parsed.topics !== 'object') return emptyStore();
    return { ...emptyStore(), ...parsed };
  } catch {
    return emptyStore(); // localStorage недоступний або пошкоджений - працюємо без збереження
  }
}

export function saveStore(store: Store): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    /* ігноруємо: приватний режим / переповнення */
  }
}

export const getTopicProgress = (store: Store, topicId: string): TopicProgress =>
  store.topics[topicId] ?? emptyTopicProgress();

export function topicStats(p: TopicProgress, totalQuestions: number) {
  const scores = p.testHistory.map((t) => t.percent);
  const best = scores.length ? Math.max(...scores) : null;
  const last = scores.length ? scores[scores.length - 1] : null;
  const average = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
  const progress = totalQuestions ? Math.round((p.completed.length / totalQuestions) * 100) : 0;
  return { best, last, average, progress, testsCompleted: scores.length };
}
