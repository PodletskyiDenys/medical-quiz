@tailwind base;
@tailwind components;
@tailwind utilities;

:root { color-scheme: light; }
html, body, #root { min-height: 100%; }
body {
  @apply bg-slate-50 text-slate-900 antialiased;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-tap-highlight-color: transparent;
}
:focus-visible { @apply outline-none ring-2 ring-brand-500 ring-offset-2; }

@layer components {
  .btn { @apply inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl px-5 py-3 text-base font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50; }
  .btn-primary { @apply btn bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700; }
  .btn-secondary { @apply btn border border-slate-300 bg-white text-slate-800 hover:bg-slate-100; }
  .card { @apply rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5; }
}

.flip-scene { perspective: 1400px; }
.flip-inner { transform-style: preserve-3d; transition: transform 0.55s cubic-bezier(0.4, 0.2, 0.2, 1); display: grid; }
.flip-inner.is-flipped { transform: rotateY(180deg); }
.flip-face { grid-area: 1 / 1; backface-visibility: hidden; -webkit-backface-visibility: hidden; }
.flip-back { transform: rotateY(180deg); }
@media (prefers-reduced-motion: reduce) { .flip-inner { transition: none; } }
