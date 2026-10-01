import { HashRouter, Route, Routes } from 'react-router-dom';
import { QuestionsProvider, useQuestions } from './hooks/useQuestions';
import { ProgressProvider } from './hooks/useProgress';
import Header from './components/Header';
import Home from './pages/Home';
import Topics from './pages/Topics';
import Topic from './pages/Topic';
import Study from './pages/Study';
import Quiz from './pages/Quiz';
import Results from './pages/Results';

function Shell() {
  const q = useQuestions();
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 pb-16 pt-5">
        {q.status === 'loading' && <p className="py-20 text-center text-slate-500" role="status">Завантаження питань…</p>}
        {q.status === 'error' && (
          <div role="alert" className="card mt-10 text-center">
            <p className="text-lg font-semibold">Не вдалося завантажити питання.</p>
            <p className="mt-1 text-slate-600">Спробуйте оновити сторінку.</p>
            <button type="button" className="btn-primary mt-4" onClick={() => location.reload()}>Оновити</button>
          </div>
        )}
        {q.status === 'ready' && (
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/topics" element={<Topics />} />
            <Route path="/topic/:topicId" element={<Topic />} />
            <Route path="/topic/:topicId/study" element={<Study />} />
            <Route path="/topic/:topicId/quiz" element={<Quiz />} />
            <Route path="/topic/:topicId/results" element={<Results />} />
            <Route path="*" element={<Home />} />
          </Routes>
        )}
      </main>
    </>
  );
}

export default function App() {
  return (
    <QuestionsProvider>
      <ProgressProvider>
        <HashRouter>
          <Shell />
        </HashRouter>
      </ProgressProvider>
    </QuestionsProvider>
  );
}
