import { Link, Navigate, useParams } from 'react-router-dom';
import { useQuestions } from '../hooks/useQuestions';
import { useProgress } from '../hooks/useProgress';
import { getTopicProgress, topicStats } from '../utils/storage';
import { percentOf } from '../utils/quiz';
import ProgressBar from '../components/ProgressBar';

export default function Results() {
  const { topicId } = useParams();
  const q = useQuestions();
  const { store } = useProgress();
  if (q.status !== 'ready') return null;
  const topic = q.data.topics.find((t) => t.id === topicId);
  const r = store.lastResult;
  if (!topic || !r || r.topicId !== topic.id) return <Navigate to={topic ? `/topic/${topic.id}` : '/topics'} replace />;

  const percent = percentOf(r.correct, r.total);
  const wrong = r.total - r.correct;
  const s = topicStats(getTopicProgress(store, topic.id), topic.questions.length);

  return (
    <div className="space-y-5 text-center">
      <h1 className="text-2xl font-bold">Тест завершено</h1>
      <section className="card" aria-label="Результат">
        <p className="text-5xl font-bold text-brand-700">{r.correct} / {r.total}</p>
        <p className="mt-1 text-2xl font-semibold">{percent}%</p>
        <div className="mt-4"><ProgressBar value={percent} tone="green" label="Результат" /></div>
        <p className="mt-4 text-green-700">Правильні: {r.correct}</p>
        <p className="text-red-700">Неправильні: {wrong}</p>
        <p className="mt-3 text-sm text-slate-500">Найкращий: {s.best ?? '—'}% · Середній: {s.average ?? '—'}% · Тестів: {s.testsCompleted}</p>
      </section>

      {wrong > 0 ? (
        <p className="font-medium">Ви зробили {wrong} {wrong === 1 ? 'помилку' : wrong < 5 ? 'помилки' : 'помилок'}.</p>
      ) : (
        <p className="font-semibold text-green-700">Вітаємо! Усі відповіді правильні.</p>
      )}

      <div className="grid gap-3">
        <Link to={`/topic/${topic.id}/quiz?count=${r.total}&r=${Date.now()}`} className="btn-primary">Повторити тест</Link>
        {wrong > 0 && <Link to={`/topic/${topic.id}/quiz?mode=last&r=${Date.now()}`} className="btn-secondary">Повторити помилки</Link>}
        <Link to={`/topic/${topic.id}/study`} className="btn-secondary">Вчити картки</Link>
        <Link to="/topics" className="btn-secondary">До тем</Link>
      </div>
    </div>
  );
}
