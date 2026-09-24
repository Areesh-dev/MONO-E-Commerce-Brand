import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  const [role, setRole] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) { setChecking(false); return; }
    let active = true;
    supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (!active) return;
        setRole(data?.role ?? null);
        setChecking(false);
      });
    return () => { active = false; };
  }, [user, loading]);

  if (loading || checking) return <LoadingSpinner />;
  if (!user || role !== 'admin') return <Navigate to="/admin/login" replace />;
  return children;
}