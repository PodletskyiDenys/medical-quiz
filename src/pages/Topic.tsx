import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useQuestions } from '../hooks/useQuestions';
import { useProgress } from '../hooks/useProgress';
import { getTopicProgress, topicStats } from '../utils/storage';
import { DEFAULT_COUNT, DEFAULT_TYPE, type QuizCount, type QuizType } from '../utils/quiz';
import ProgressBar from '../components/ProgressBar';

const COUNTS: QuizCount[] = [10, 20, 30, 'all'];

export default function Topic() {
  const { topicId } = useParams();
  const nav = useNavigate();
  const q = useQuestions();
  const { store } = useProgress();
  const [count, setCount] = useState<QuizCount>(DEFAULT_COUNT);
  const [type, setType] = useState<QuizType>(DEFAULT_TYPE);
  if (q.status !== 'ready') return null;

  const topic = q.data.topics.find((t) => t.id === topicId);
  if (!topic) return <Navigate to="/topics" replace />;

  const p = getTopicProgress(store, topic.id);
  const s = topicStats(p, topic.questions.length);
  const mistakes = p.incorrectQuestions.length;
  const stat = (label: string, v: number | null) => (
    <div className="rounded-xl bg-slate-50 p-3 text-center"><dt className="text-xs text-slate-500">{label}</dt><dd className="text-lg font-bold">{v === null ? '—' : `${v}%`}</dd></div>
  );

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Link to="/topics" className="text-sm font-medium text-brand-700">← До тем</Link>
      <header>
        <h1 className="text-2xl font-bold leading-snug break-words sm:text-3xl">{topic.name}</h1>
        <p className="mt-1 text-slate-600">{topic.questions.length} питань</p>
      </header>

      <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
      <div className="space-y-5">
      <section className="card" aria-label="Статистика">
        <div className="mb-2 flex justify-between text-sm"><span className="font-medium">Прогрес</span><span className="font-bold">{s.progress}%</span></div>
        <ProgressBar value={s.progress} label={`Прогрес: ${topic.name}`} />
        <dl className="mt-4 grid grid-cols-3 gap-2">{stat('Найкращий', s.best)}{stat('Останній', s.last)}{stat('Середній', s.average)}</dl>
        <p className="mt-3 text-sm text-slate-500">Тестів пройдено: {s.testsCompleted}</p>
      </section>

      <Link to={`/topic/${topic.id}/study`} className="btn-secondary w-full">Вчити картки</Link>
      </div>

      <fieldset className="card">
        <legend className="px-1 text-base font-semibold">Тест</legend>
        <p className="mt-1 text-sm font-medium text-slate-700">Тип тесту</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {([['choice', 'З варіантами', '1 правильна + 3 хибні'], ['self', 'Самоперевірка', 'Згадати і оцінити себе']] as const).map(([v, title, hint]) => (
            <label key={v} className={`flex min-h-[56px] cursor-pointer flex-col justify-center rounded-xl border-2 px-4 py-2 focus-within:ring-2 focus-within:ring-brand-500 ${type === v ? 'border-brand-500 bg-brand-50' : 'border-slate-300 bg-white'}`}>
              <input type="radio" name="type" className="sr-only" checked={type === v} onChange={() => setType(v)} />
              <span className={`font-semibold ${type === v ? 'text-brand-700' : ''}`}>{title}</span>
              <span className="text-xs text-slate-500">{hint}</span>
            </label>
          ))}
        </div>
        <p className="mt-4 text-sm font-medium text-slate-700">Кількість питань</p>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {COUNTS.map((c) => (
            <label key={c} className={`flex min-h-[48px] cursor-pointer items-center justify-center rounded-xl border-2 text-base font-semibold focus-within:ring-2 focus-within:ring-brand-500 ${count === c ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-300 bg-white'}`}>
              <input type="radio" name="count" className="sr-only" checked={count === c} onChange={() => setCount(c)} />
              {c === 'all' ? 'Усі' : c}
            </label>
          ))}
        </div>
        <button type="button" className="btn-primary mt-4 w-full" onClick={() => nav(`/topic/${topic.id}/quiz?count=${count}&type=${type}`)}>Пройти тест</button>
        {mistakes > 0 && (
          <button type="button" className="btn-secondary mt-2 w-full" onClick={() => nav(`/topic/${topic.id}/quiz?mode=mistakes&type=${type}`)}>Повторити помилки ({mistakes})</button>
        )}
      </fieldset>
      </div>
    </div>
  );
}
