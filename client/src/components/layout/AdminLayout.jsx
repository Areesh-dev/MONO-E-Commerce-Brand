import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, Tags, Users, ShoppingBag, Star, Image,
  HelpCircle, Share2, Settings, LogOut, Award, BookOpen, Menu, X, Ruler, TicketPercent,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import Logo from '../ui/Logo';

const nav = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: Tags },
  { to: '/admin/sizes', label: 'Sizes', icon: Ruler },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/reviews', label: 'Reviews', icon: Star },
  { to: '/admin/hero', label: 'Hero Slider', icon: Image },
  { to: '/admin/why-choose-us', label: 'Why Choose Us', icon: Award },
  { to: '/admin/content-sections', label: 'Mission & Vision', icon: BookOpen },
  { to: '/admin/brands', label: 'Brands', icon: Award },
  { to: '/admin/faqs', label: 'FAQs', icon: HelpCircle },
  { to: '/admin/coupons', label: 'Coupons', icon: TicketPercent },
  { to: '/admin/social-links', label: 'Social Links', icon: Share2 },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

function SidebarContent({ onNavigate, onLogout }) {
  return (
    <>
      <div className="h-16 flex items-center justify-between px-6 border-b border-ink-line flex-shrink-0">
        <div className="flex items-center gap-2">
          <Logo size="md" asLink={false} />
          <span className="text-[9px] uppercase tracking-nav text-ink-dim">Admin</span>
        </div>
      </div>

      <nav
        aria-label="Admin navigation"
        className="flex-1 py-4 overflow-y-auto overflow-x-hidden no-scrollbar min-h-0"
      >
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 text-xs uppercase tracking-nav transition-colors ${
                isActive
                  ? 'text-ink-white bg-ink-surface border-l-2 border-ink-white'
                  : 'text-ink-dim hover:text-ink-white border-l-2 border-transparent'
              }`
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} aria-hidden="true" />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
      </nav>

      <button
        onClick={onLogout}
        className="m-4 flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-nav text-ink-dim hover:text-ink-white border border-ink-line transition-colors flex-shrink-0"
      >
        <LogOut className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
        Logout
      </button>
    </>
  );
}

export default function AdminLayout() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerRef = useFocusTrap(mobileOpen);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e) => e.key === 'Escape' && setMobileOpen(false);
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [mobileOpen]);

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-ink-surface">
      <aside className="hidden lg:flex flex-col fixed top-0 left-0 bottom-0 w-64 border-r border-ink-line bg-ink-card z-30">
        <SidebarContent onLogout={handleLogout} />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="admin-backdrop"
              className="fixed inset-0 z-[90] bg-ink/80 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <motion.aside
              key="admin-drawer"
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-label="Admin menu"
              className="fixed top-0 left-0 bottom-0 z-[100] w-72 max-w-[85vw] bg-ink-card border-r border-ink-line flex flex-col lg:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center text-ink-dim hover:text-ink-white transition-colors z-10"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>

              <SidebarContent
                onNavigate={() => setMobileOpen(false)}
                onLogout={handleLogout}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex flex-col min-w-0 lg:ml-64 min-h-screen">
        <header className="lg:hidden sticky top-0 z-40 h-14 bg-ink-card border-b border-ink-line flex items-center justify-between px-4 flex-shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            aria-controls="admin-drawer"
            className="w-10 h-10 -ml-2 flex items-center justify-center text-ink-text hover:text-ink-white transition-colors"
          >
            <Menu className="w-5 h-5" strokeWidth={1.5} />
          </button>

          <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
            <Logo size="md" asLink={false} />
            <span className="text-[9px] uppercase tracking-nav text-ink-dim">Admin</span>
          </div>

          <div className="w-10" aria-hidden="true" />
        </header>

        <main id="main-content" className="flex-1 min-w-0">
          <div className="p-4 sm:p-6 lg:p-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}