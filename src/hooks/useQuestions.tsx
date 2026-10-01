import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { QuestionsData } from '../types/questions';

type State = { status: 'loading' } | { status: 'error' } | { status: 'ready'; data: QuestionsData };
const Ctx = createContext<State>({ status: 'loading' });

export function QuestionsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    import('../data/questions.json')
      .then((m) => {
        const data = (m.default ?? m) as QuestionsData;
        if (!data?.topics?.length) throw new Error('empty');
        if (!cancelled) setState({ status: 'ready', data });
      })
      .catch(() => !cancelled && setState({ status: 'error' }));
    return () => {
      cancelled = true;
    };
  }, []);

  return <Ctx.Provider value={state}>{children}</Ctx.Provider>;
}

export const useQuestions = () => useContext(Ctx);
