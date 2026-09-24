import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname, search } = useLocation();
  const navigationType = useNavigationType(); 
  const scrollPositions = useRef(new Map());

  useEffect(() => {
    const key = pathname + search;

    if (navigationType === 'POP') {
      const saved = scrollPositions.current.get(key);
      if (saved) {
        window.scrollTo({ top: saved, behavior: 'instant' in window ? 'instant' : 'auto' });
      } else {
        window.scrollTo(0, 0);
      }
      return;
    }

    return () => {
      scrollPositions.current.set(key, window.scrollY);
    };
  }, [pathname, search, navigationType]);

  useEffect(() => {
    if (navigationType !== 'POP') {
      window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    }
  }, [pathname, search, navigationType]);

  return null;
}