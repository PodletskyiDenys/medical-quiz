import { Link } from 'react-router-dom';
import type { Topic } from '../types/questions';
import { getTopicProgress, topicStats } from '../utils/storage';
import { useProgress } from '../hooks/useProgress';
import ProgressBar from './ProgressBar';

export default function TopicCard({ topic, detailed = false }: { topic: Topic; detailed?: boolean }) {
  const { store } = useProgress();
  const s = topicStats(getTopicProgress(store, topic.id), topic.questions.length);

  return (
    <article className="card flex flex-col">
      <Link to={`/topic/${topic.id}`} className="block rounded-lg" aria-label={`${topic.name}, ${topic.questions.length} питань, прогрес ${s.progress}%`}>
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold leading-snug text-slate-900 break-words">{topic.name}</h3>
          <span className="shrink-0 text-lg font-bold text-brand-700">{s.progress}%</span>
        </div>
        <p className="mt-1 text-sm text-slate-500">{topic.questions.length} питань</p>
        <div className="mt-3"><ProgressBar value={s.progress} label={`Прогрес: ${topic.name}`} /></div>
      </Link>
      {detailed && (
        <>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-lg bg-slate-50 p-2"><dt className="text-slate-500">Найкращий</dt><dd className="font-semibold">{s.best === null ? '—' : `${s.best}%`}</dd></div>
            <div className="rounded-lg bg-slate-50 p-2"><dt className="text-slate-500">Останній</dt><dd className="font-semibold">{s.last === null ? '—' : `${s.last}%`}</dd></div>
          </dl>
          <div className="mt-auto grid gap-2 pt-3 sm:grid-cols-2">
            <Link to={`/topic/${topic.id}/study`} className="btn-secondary">Вчити картки</Link>
            <Link to={`/topic/${topic.id}`} className="btn-primary">Пройти тест</Link>
          </div>
        </>
      )}
    </article>
  );
}
