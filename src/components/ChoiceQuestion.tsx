import { useEffect } from 'react';
import type { Question } from '../types/questions';

interface Props {
  question: Question;
  index: number;
  total: number;
  options: string[];
  correctIndex: number;
  selected: number | null; // null = ще не відповіли
  onSelect: (i: number) => void;
}

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

export default function ChoiceQuestion({ question, index, total, options, correctIndex, selected, onSelect }: Props) {
  const answered = selected !== null;
  const isCorrect = selected === correctIndex;

  // Клавіші 1-4 для вибору (доступність без миші)
  useEffect(() => {
    if (answered) return;
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (n >= 1 && n <= options.length) onSelect(n - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [answered, options.length, onSelect]);

  const tone = (i: number) => {
    if (!answered) return 'border-slate-300 bg-white text-slate-900 hover:border-brand-500 hover:bg-brand-50';
    if (i === correctIndex) return 'border-green-600 bg-green-50 text-green-950';
    if (i === selected) return 'border-red-600 bg-red-50 text-red-950';
    return 'border-slate-200 bg-white text-slate-400';
  };

  return (
    <section className="card lg:p-8" aria-labelledby="q-text">
      <p className="text-sm font-semibold text-brand-700">Питання {index + 1} / {total}</p>
      <p id="q-text" className="mt-3 text-lg leading-relaxed break-words sm:text-xl lg:text-2xl">{question.question}</p>

      <ul className="mt-5 grid gap-3" role="radiogroup" aria-label="Варіанти відповіді">
        {options.map((text, i) => (
          <li key={i}>
            <button
              type="button"
              role="radio"
              aria-checked={selected === i}
              disabled={answered}
              onClick={() => onSelect(i)}
              className={`flex min-h-[56px] w-full items-start gap-3 rounded-xl border-2 px-4 py-3 text-left text-base leading-relaxed break-words transition-colors disabled:cursor-default sm:text-lg ${tone(i)}`}
            >
              <span aria-hidden="true" className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-current text-sm font-bold">
                {answered && i === correctIndex ? '✓' : answered && i === selected ? '✗' : LETTERS[i]}
              </span>
              <span>{text}</span>
            </button>
          </li>
        ))}
      </ul>

      <div aria-live="polite" className="mt-4 min-h-[1.5rem]">
        {answered && (isCorrect ? (
          <p className="text-lg font-bold text-green-700">✓ Правильно</p>
        ) : (
          <div>
            <p className="text-lg font-bold text-red-700">✗ Неправильно</p>
            <p className="mt-1 text-sm text-slate-600">Правильна відповідь: <span className="font-semibold text-green-800">{options[correctIndex]}</span></p>
          </div>
        ))}
      </div>
    </section>
  );
}
