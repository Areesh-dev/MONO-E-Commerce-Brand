import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function TopLoadingBar() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setLoading(true);
    setProgress(12);

    const t1 = setTimeout(() => setProgress(45), 120);
    const t2 = setTimeout(() => setProgress(78), 260);

    const finish = setTimeout(() => {
      setProgress(100);
      const hide = setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 220);
      return () => clearTimeout(hide);
    }, 420);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(finish);
    };
  }, [location.pathname]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className="fixed top-0 left-0 right-0 h-[2px] z-[300] bg-transparent pointer-events-none"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="h-full bg-ink-white origin-left"
            style={{ boxShadow: '0 0 8px rgba(245,245,245,0.5)' }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: progress / 100 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}