import { Link } from 'react-router-dom';
import { useQuestions } from '../hooks/useQuestions';
import { useProgress } from '../hooks/useProgress';
import { getTopicProgress } from '../utils/storage';
import TopicCard from '../components/TopicCard';

export default function Home() {
  const q = useQuestions();
  const { store } = useProgress();
  if (q.status !== 'ready') return null;
  const topics = q.data.topics;
  const total = topics.reduce((s, t) => s + t.questions.length, 0);

  const last = store.lastVisited ? topics.find((t) => t.id === store.lastVisited!.topicId) : undefined;
  const lastIdx = last ? Math.min(getTopicProgress(store, last.id).currentQuestion, last.questions.length - 1) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Medical Quiz</h1>
        <p className="mt-1 text-slate-600">{topics.length} тем · {total} питань</p>
      </div>

      {last && (
        <section aria-labelledby="resume" className="rounded-2xl bg-brand-500 p-5 text-white shadow-md">
          <h2 id="resume" className="text-sm font-semibold uppercase tracking-wider text-brand-100">Продовжити навчання</h2>
          <p className="mt-2 text-lg font-semibold leading-snug break-words">{last.name}</p>
          <p className="text-brand-100">Питання {lastIdx + 1} / {last.questions.length}</p>
          <Link to={`/topic/${last.id}/study`} className="btn mt-4 w-full bg-white text-brand-700 hover:bg-brand-50 sm:w-auto">Продовжити</Link>
        </section>
      )}

      <section aria-labelledby="topics-h">
        <h2 id="topics-h" className="mb-3 text-xl font-bold">Теми</h2>
        <div className="space-y-3">{topics.map((t) => <TopicCard key={t.id} topic={t} />)}</div>
      </section>
    </div>
  );
}
