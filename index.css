type Tone = 'correct' | 'wrong' | 'neutral';

const tones: Record<Tone, string> = {
  correct: 'border-green-600 bg-green-50 text-green-950',
  wrong: 'border-red-600 bg-red-50 text-red-950',
  neutral: 'border-slate-300 bg-white text-slate-900',
};

/** Один рядок відповіді (показується після відкриття відповіді в Quiz) */
export default function AnswerOption({ text, tone = 'correct' }: { text: string; tone?: Tone }) {
  return (
    <li className={`flex items-start gap-3 rounded-xl border-2 px-4 py-3 text-base leading-relaxed break-words ${tones[tone]}`}>
      <span aria-hidden="true" className="mt-0.5 font-bold">{tone === 'wrong' ? '✗' : '✓'}</span>
      <span>{text}</span>
    </li>
  );
}
