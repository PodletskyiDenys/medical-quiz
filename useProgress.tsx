interface Props { value: number; label?: string; tone?: 'brand' | 'green' }

export default function ProgressBar({ value, label = 'Прогрес', tone = 'brand' }: Props) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={v}
      className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200"
    >
      <div className={`h-full rounded-full transition-all ${tone === 'green' ? 'bg-green-600' : 'bg-brand-500'}`} style={{ width: `${v}%` }} />
    </div>
  );
}
