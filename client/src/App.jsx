import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import AppRoutes from './routes/AppRoutes';
import { FullPageLoader } from './components/ui/LoadingSpinner';

const MIN_INTRO_MS = 1400;

export default function App() {
  const [introDone, setIntroDone] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('mono-intro-seen')) {
      setIntroDone(true);
      return;
    }

    const t = setTimeout(() => {
      sessionStorage.setItem('mono-intro-seen', '1');
      setIntroDone(true);
    }, MIN_INTRO_MS);

    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <AppRoutes />
      <AnimatePresence>
        {!introDone && <FullPageLoader key="intro" label="Welcome" />}
      </AnimatePresence>
    </>
  );
}