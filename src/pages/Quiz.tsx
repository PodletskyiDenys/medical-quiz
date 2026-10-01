import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuestions } from '../hooks/useQuestions';
import { useProgress } from '../hooks/useProgress';
import { buildQuiz, parseCount, percentOf } from '../utils/quiz';
import { getTopicProgress } from '../utils/storage';
import type { Question, Topic } from '../types/questions';
import QuestionCard from '../components/QuestionCard';
import ProgressBar from '../components/ProgressBar';

function pick(topic: Topic, params: URLSearchParams, wrongIds: string[], storedWrong: string[]): Question[] {
  const mode = params.get('mode');
  const ids = mode === 'last' ? wrongIds : mode === 'mistakes' ? storedWrong : null;
  if (ids) {
    const set = new Set(ids);
    return buildQuiz(topic.questions.filter((x) => set.has(x.id)), 'all');
  }
  return buildQuiz(topic.questions, parseCount(params.get('count')));
}

export default function Quiz() {
  const { topicId } = useParams();
  const [params] = useSearchParams();
  const q = useQuestions();
  if (q.status !== 'ready') return null;
  const topic = q.data.topics.find((t) => t.id === topicId);
  if (!topic) return <Navigate to="/topics" replace />;
  // key скидає сесію при повторі тесту
  return <QuizSession key={params.toString() + (params.get('r') ?? '')} topic={topic} params={params} />;
}

function QuizSession({ topic, params }: { topic: Topic; params: URLSearchParams }) {
  const nav = useNavigate();
  const { store, setLastVisited, recordAnswer, finishTest } = useProgress();
  const questions = useMemo(
    () => pick(topic, params, store.lastResult?.topicId === topic.id ? store.lastResult.wrongIds : [], getTopicProgress(store, topic.id).incorrectQuestions),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const [i, setI] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [verdict, setVerdict] = useState<boolean | null>(null);
  const [wrong, setWrong] = useState<string[]>([]);
  const [correct, setCorrect] = useState(0);

  useEffect(() => setLastVisited(topic.id), [topic.id, setLastVisited]);

  if (questions.length === 0) {
    return (
      <div className="card text-center">
        <p className="text-lg font-semibold">Немає питань для цього тесту.</p>
        <Link to={`/topic/${topic.id}`} className="btn-primary mt-4">До теми</Link>
      </div>
    );
  }

  const current = questions[i];
  const isLast = i === questions.length - 1;

  const grade = (knew: boolean) => {
    if (verdict !== null) return; // відповідь змінити не можна
    setVerdict(knew);
    recordAnswer(topic.id, current.id, knew);
    if (knew) setCorrect((c) => c + 1);
    else setWrong((w) => [...w, current.id]);
  };

  const next = () => {
    if (!isLast) { setI(i + 1); setRevealed(false); setVerdict(null); return; }
    const total = questions.length;
    finishTest(topic.id, total, correct, wrong, percentOf(correct, total));
    nav(`/topic/${topic.id}/results`, { replace: true });
  };

  return (
    <div className="space-y-4">
      <Link to={`/topic/${topic.id}`} className="text-sm font-medium text-brand-700">← Завершити тест</Link>
      <ProgressBar value={((i + (verdict !== null ? 1 : 0)) / questions.length) * 100} label="Прогрес тесту" />
      <QuestionCard question={current} index={i} total={questions.length} revealed={revealed} verdict={verdict} onReveal={() => setRevealed(true)} onGrade={grade} />
      {verdict !== null && (
        <button type="button" className="btn-primary w-full" onClick={next} autoFocus>{isLast ? 'Завершити' : 'Далі →'}</button>
      )}
    </div>
  );
}
