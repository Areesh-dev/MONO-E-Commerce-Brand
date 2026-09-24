import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { LogOut, Package, Star, Mail, Calendar, Heart  } from 'lucide-react';
import { toast } from 'sonner';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import AsyncBoundary from '../components/ui/AsyncBoundary';
import { ProfileSkeleton } from '../components/skeletons';
import Seo from '../components/seo/Seo';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const fmtDate = (iso) =>
  new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(iso));

export default function Profile() {
  const { user, signOut } = useAuth();
  const [state, setState] = useState({ loading: true, error: null, profile: null, orderCount: 0 });

  useEffect(() => {
    if (!user) return;
    let active = true;
    Promise.all([
      supabase.from('profiles').select('name,email,created_at').eq('id', user.id).single(),
      supabase.from('orders').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    ])
      .then(([p, o]) => {
        if (!active) return;
        setState({ loading: false, error: p.error, profile: p.data, orderCount: o.count || 0 });
      })
      .catch((e) => active && setState({ loading: false, error: e, profile: null, orderCount: 0 }));
    return () => { active = false; };
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out');
  };

  if (state.loading) return <ProfileSkeleton />;

  return (
    <>
      <Seo title="Profile" noIndex />
      <Container className="py-16">
        <div className="mb-12">
          <span className="text-[10px] uppercase tracking-editorial text-ink-dim">Account</span>
          <h1 className="heading-editorial text-4xl sm:text-5xl text-ink-white mt-3">
            {state.profile?.name || 'Profile'}
          </h1>
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-10">
          <div className="space-y-6">
            <section className="border border-ink-line bg-ink-card p-6">
              <h2 className="text-[11px] uppercase tracking-editorial text-ink-white mb-6">Details</h2>
              <dl className="space-y-4 text-sm">
                <div className="flex items-center gap-4">
                  <Mail className="w-4 h-4 text-ink-dim" strokeWidth={1.5} aria-hidden="true" />
                  <dt className="sr-only">Email</dt>
                  <dd className="text-ink-white">{state.profile?.email}</dd>
                </div>
                <div className="flex items-center gap-4">
                  <Calendar className="w-4 h-4 text-ink-dim" strokeWidth={1.5} aria-hidden="true" />
                  <dt className="sr-only">Signup date</dt>
                  <dd className="text-ink-white">Joined {fmtDate(state.profile?.created_at)}</dd>
                </div>
              </dl>
            </section>

            <section className="grid sm:grid-cols-3 gap-4">
              <Link
                to="/profile/orders"
                className="border border-ink-line bg-ink-card p-6 hover:border-ink-soft transition-colors"
              >
                <Package className="w-5 h-5 text-ink-soft" strokeWidth={1.5} aria-hidden="true" />
                <p className="mt-4 text-sm uppercase tracking-nav text-ink-white">My Orders</p>
                <p className="mt-1 text-[10px] uppercase tracking-editorial text-ink-dim">
                  {state.orderCount} order{state.orderCount === 1 ? '' : 's'}
                </p>
              </Link>
              <Link
                to="/wishlist"
                className="border border-ink-line bg-ink-card p-6 hover:border-ink-soft transition-colors"
              >
                <Heart className="w-5 h-5 text-ink-soft" strokeWidth={1.5} aria-hidden="true" />
                <p className="mt-4 text-sm uppercase tracking-nav text-ink-white">Wishlist</p>
                <p className="mt-1 text-[10px] uppercase tracking-editorial text-ink-dim">
                  Saved pieces
                </p>
              </Link>
              <div className="border border-ink-line bg-ink-card p-6">
                <Star className="w-5 h-5 text-ink-soft" strokeWidth={1.5} aria-hidden="true" />
                <p className="mt-4 text-sm uppercase tracking-nav text-ink-white">Reviews</p>
                <p className="mt-1 text-[10px] uppercase tracking-editorial text-ink-dim">
                  Leave a review from any product page
                </p>
              </div>
            </section>
          </div>

          <aside className="border border-ink-line bg-ink-card p-6 h-fit">
            <h2 className="text-[11px] uppercase tracking-editorial text-ink-white mb-6">Session</h2>
            <Button variant="secondary" size="sm" className="w-full" onClick={handleSignOut}>
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" /> Sign Out
            </Button>
          </aside>
        </div>
      </Container>
    </>
  );
}