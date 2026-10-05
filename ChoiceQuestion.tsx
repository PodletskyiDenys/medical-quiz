export interface Question {
  id: string;
  sourceNumber: number;
  question: string;
  /** У поточному джерелі хибних варіантів немає - поле зарезервоване для майбутніх даних */
  options: string[] | null;
  correctAnswer: number | null;
  /** Усі правильні відповіді, як вони записані в джерелі (рядки з «*») */
  answers: string[];
  explanation: string | null;
}

export interface Topic {
  id: string;
  name: string;
  questions: Question[];
}

export interface QuestionsData {
  topics: Topic[];
}

export interface TestResultEntry {
  date: string;
  total: number;
  correct: number;
  percent: number;
}

export interface TopicProgress {
  currentQuestion: number; // індекс картки (0-based), на якій зупинилися
  completed: string[]; // id питань, відповідь на які вже бачили/оцінили
  testHistory: TestResultEntry[];
  incorrectQuestions: string[];
}

export interface LastResult {
  topicId: string;
  total: number;
  correct: number;
  wrongIds: string[];
  kind?: 'choice' | 'self';
}

export interface Store {
  version: 1;
  lastVisited: { topicId: string } | null;
  lastResult: LastResult | null;
  topics: Record<string, TopicProgress>;
}
