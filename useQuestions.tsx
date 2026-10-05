import { Link, NavLink } from 'react-router-dom';

const link = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-2 py-2 text-sm font-medium sm:px-3 ${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'}`;

export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-2 sm:px-6 sm:py-3 lg:px-8">
        <Link to="/" className="flex items-center gap-2 whitespace-nowrap text-base font-bold text-brand-700 sm:text-lg" aria-label="Medical Quiz — на головну">
          <span aria-hidden="true" className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500 text-white">+</span>
          Medical Quiz
        </Link>
        <nav aria-label="Основна навігація" className="flex gap-1">
          <NavLink to="/" end className={link}>Головна</NavLink>
          <NavLink to="/topics" className={link}>Теми</NavLink>
        </nav>
      </div>
    </header>
  );
}
