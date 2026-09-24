import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { fetchSiteSettings } from '../lib/branding';

const BrandingContext = createContext(null);

export function BrandingProvider({ children }) {
  const [state, setState] = useState({ loading: true, settings: {} });

  const load = useCallback(async () => {
    try {
      const settings = await fetchSiteSettings();
      setState({ loading: false, settings });
    } catch {
      setState({ loading: false, settings: {} });
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const update = useCallback((patch) => {
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  }, []);

  return (
    <BrandingContext.Provider value={{ ...state, refresh: load, update }}>
      {children}
    </BrandingContext.Provider>
  );
}

export const useBranding = () => {
  const ctx = useContext(BrandingContext);
  if (!ctx) throw new Error('useBranding must be used within BrandingProvider');
  return ctx;
};