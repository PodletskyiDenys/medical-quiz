import { useRef, type KeyboardEvent, type TouchEvent } from 'react';
import type { Question } from '../types/questions';

interface Props {
  question: Question;
  flipped: boolean;
  onFlip: () => void;
  onPrev: () => void;
  onNext: () => void;
}

const SWIPE_PX = 50;

export default function Flashcard({ question, flipped, onFlip, onPrev, onNext }: Props) {
  const start = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);

  const onTouchStart = (e: TouchEvent) => {
    const t = e.touches[0];
    start.current = { x: t.clientX, y: t.clientY };
    swiped.current = false;
  };
  const onTouchEnd = (e: TouchEvent) => {
    if (!start.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.current.x;
    const dy = t.clientY - start.current.y;
    start.current = null;
    if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy) * 1.5) {
      swiped.current = true;
      (dx < 0 ? onNext : onPrev)();
    }
  };
  const onClick = () => {
    if (swiped.current) { swiped.current = false; return; }
    onFlip();
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onFlip(); }
  };

  return (
    <div className="flip-scene" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div
        role="button"
        tabIndex={0}
        aria-pressed={flipped}
        aria-label={flipped ? 'Картка показує відповідь. Натисніть, щоб повернути до питання' : 'Картка показує питання. Натисніть, щоб побачити відповідь'}
        onClick={onClick}
        onKeyDown={onKey}
        className={`flip-inner cursor-pointer rounded-3xl select-none ${flipped ? 'is-flipped' : ''}`}
      >
        <div className="flip-face flex min-h-[320px] flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-md sm:min-h-[380px] sm:p-8 lg:min-h-[440px] lg:p-12" aria-hidden={flipped}>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Питання</span>
          <p className="my-auto py-4 text-lg leading-relaxed text-slate-900 break-words sm:text-xl lg:text-2xl">{question.question}</p>
          <span className="text-center text-sm text-slate-500">Натисніть картку для відповіді</span>
        </div>
        <div className="flip-face flip-back flex min-h-[320px] flex-col rounded-3xl border border-green-200 bg-green-50 p-5 shadow-md sm:min-h-[380px] sm:p-8 lg:min-h-[440px] lg:p-12" aria-hidden={!flipped}>
          <span className="text-xs font-bold uppercase tracking-wider text-green-800">
            {question.answers.length > 1 ? 'Правильні відповіді' : 'Правильна відповідь'}
          </span>
          <div className="my-auto py-4">
            {question.answers.length > 1 ? (
              <ul className="list-disc space-y-2 pl-5 text-lg leading-relaxed text-green-950 break-words sm:text-xl lg:text-2xl">
                {question.answers.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            ) : (
              <p className="text-lg font-medium leading-relaxed text-green-950 break-words sm:text-xl lg:text-2xl">{question.answers[0]}</p>
            )}
          </div>
          <span className="text-center text-sm text-green-800/80">Натисніть, щоб повернути до питання</span>
        </div>
      </div>
    </div>
  );
}
