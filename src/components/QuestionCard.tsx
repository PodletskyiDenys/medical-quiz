import type { Question } from '../types/questions';
import AnswerOption from './AnswerOption';

interface Props {
  question: Question;
  index: number;
  total: number;
  revealed: boolean;
  verdict: boolean | null; // true = знав, false = не знав, null = ще не оцінено
  onReveal: () => void;
  onGrade: (knew: boolean) => void;
}

export default function QuestionCard({ question, index, total, revealed, verdict, onReveal, onGrade }: Props) {
  const graded = verdict !== null;
  return (
    <section className="card" aria-live="polite">
      <p className="text-sm font-semibold text-brand-700">Питання {index + 1} / {total}</p>
      <p className="mt-3 text-lg leading-relaxed break-words sm:text-xl">{question.question}</p>

      {!revealed ? (
        <div className="mt-6">
          <p className="mb-3 text-sm text-slate-500">Спочатку пригадайте відповідь, потім відкрийте її.</p>
          <button type="button" className="btn-primary w-full" onClick={onReveal}>Показати відповідь</button>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-green-800">
              {question.answers.length > 1 ? 'Правильні відповіді' : 'Правильна відповідь'}
            </p>
            <ul className="space-y-2">{question.answers.map((a, i) => <AnswerOption key={i} text={a} />)}</ul>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">{graded ? (verdict ? '✓ Зараховано: знав' : '✗ Зараховано: не знав') : 'Ви знали відповідь?'}</p>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" disabled={graded} onClick={() => onGrade(false)}
                className={`btn whitespace-nowrap px-3 border-2 ${verdict === false ? 'border-red-600 bg-red-600 text-white' : 'border-red-300 bg-white text-red-700 hover:bg-red-50'}`}>
                ✗ Не знав
              </button>
              <button type="button" disabled={graded} onClick={() => onGrade(true)}
                className={`btn whitespace-nowrap px-3 border-2 ${verdict === true ? 'border-green-600 bg-green-600 text-white' : 'border-green-300 bg-white text-green-700 hover:bg-green-50'}`}>
                ✓ Знав
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
