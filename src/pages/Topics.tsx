import { useQuestions } from '../hooks/useQuestions';
import TopicCard from '../components/TopicCard';

export default function Topics() {
  const q = useQuestions();
  if (q.status !== 'ready') return null;
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Теми</h1>
      <div className="space-y-4">{q.data.topics.map((t) => <TopicCard key={t.id} topic={t} detailed />)}</div>
    </div>
  );
}
