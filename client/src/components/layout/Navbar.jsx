import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, User, LogIn, Heart, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Container from '../ui/Container';
import { brand } from '../../config/brand';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import PrefetchLink from '../ui/PrefetchLink';
import Logo from '../ui/Logo';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Catalog' },
  { to: '/categories', label: 'Categories' },
  { to: '/faq', label: 'Support' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { count: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const mobileMenuRef = useFocusTrap(mobileOpen);
  const searchInputRef = useRef(null);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) searchInputRef.current.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e) => e.key === 'Escape' && setMobileOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const submitSearch = (e) => {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    navigate(`/search?q=${encodeURIComponent(term)}`);
    setQ('');
    setSearchOpen(false);
  };

  return (
    <>
      <div className="bg-ink-card border-b border-ink-line">
        <Container className="py-2">
          <p className="text-[9px] uppercase tracking-editorial text-ink-text text-center">
            {brand.announcement}
          </p>
        </Container>
      </div>

      <header className="sticky top-0 z-50 bg-ink border-b border-ink-line">
        <Container className="h-16 flex items-center justify-between gap-3 sm:gap-4">
          {/* Desktop primary nav (lg+) */}
          <nav aria-label="Primary" className="hidden lg:flex items-center gap-8 flex-1">
            {navLinks.map((l) => (
              <PrefetchLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) => `nav-link ${isActive ? 'text-ink-white' : ''}`}
              >
                {({ isActive }) => (
                  <span aria-current={isActive ? 'page' : undefined}>{l.label}</span>
                )}
              </PrefetchLink>
            ))}
          </nav>

          {/* Logo */}
          <div className="flex-1 lg:flex-none flex lg:justify-center">
            <Logo size="md" />
          </div>

          {/* Right cluster */}
          <div className="flex items-center gap-3 sm:gap-4 flex-1 justify-end">
            {/* Search — always visible */}
            <button
              type="button"
              onClick={() => setSearchOpen((s) => !s)}
              aria-label={searchOpen ? 'Close search' : 'Open search'}
              aria-expanded={searchOpen}
              aria-controls="site-search"
              className="text-ink-text hover:text-ink-white"
            >
              <Search className="w-[18px] h-[18px]" strokeWidth={1.5} />
            </button>

            {/* Desktop only: Account */}
            <Link
              to={user ? '/profile' : '/login'}
              aria-label={user ? 'Account' : 'Sign in'}
              className="hidden lg:block text-ink-text hover:text-ink-white"
            >
              <User className="w-[18px] h-[18px]" strokeWidth={1.5} />
            </Link>

            {/* Desktop only: Wishlist */}
            <Link
              to="/wishlist"
              aria-label={`Wishlist, ${wishlistCount} item${wishlistCount === 1 ? '' : 's'}`}
              className="hidden lg:block relative text-ink-text hover:text-ink-white"
            >
              <Heart className="w-[18px] h-[18px]" strokeWidth={1.5} />
              {wishlistCount > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute -top-2 -right-2 bg-ink-white text-ink text-[9px] font-bold w-4 h-4 flex items-center justify-center"
                >
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart — always visible */}
            <Link
              to="/cart"
              aria-label={`Cart, ${cartCount} item${cartCount === 1 ? '' : 's'}`}
              className="relative text-ink-text hover:text-ink-white"
            >
              <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={1.5} />
              {cartCount > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute -top-2 -right-2 bg-ink-white text-ink text-[9px] font-bold w-4 h-4 flex items-center justify-center"
                >
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile/Tablet only: Profile (if signed in) or Login (if signed out) */}
            <Link
              to={user ? '/profile' : '/login'}
              aria-label={user ? 'Account' : 'Sign in'}
              className="lg:hidden text-ink-text hover:text-ink-white"
            >
              {user ? (
                <User className="w-[18px] h-[18px]" strokeWidth={1.5} />
              ) : (
                <LogIn className="w-[18px] h-[18px]" strokeWidth={1.5} />
              )}
            </Link>

            {/* Mobile/Tablet only: Menu */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              className="lg:hidden text-ink-text hover:text-ink-white"
            >
              <Menu className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>
        </Container>

        {/* Site search — expands below the header */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              id="site-search"
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="border-t border-ink-line overflow-hidden"
            >
              <Container className="py-4">
                <form
                  role="search"
                  onSubmit={submitSearch}
                  className="flex flex-col sm:flex-row gap-2 sm:gap-3"
                >
                  <label htmlFor="site-search-input" className="sr-only-focusable">
                    Search products
                  </label>
                  <input
                    ref={searchInputRef}
                    id="site-search-input"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search products…"
                    className="flex-1 h-11 px-4 bg-ink-surface border border-ink-line text-ink-white placeholder:text-ink-muted text-sm focus:border-ink-text focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="h-11 px-6 bg-ink-white text-ink text-xs uppercase tracking-nav hover:bg-ink hover:text-ink-white border border-ink-white transition-colors"
                  >
                    Search
                  </button>
                </form>
              </Container>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile / Tablet menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            ref={mobileMenuRef}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile menu"
            className="fixed inset-0 z-[80] bg-ink lg:hidden overflow-y-auto"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.25 }}
          >
            <Container className="h-16 flex items-center justify-between">
              <Logo size="md" />
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="text-ink-text hover:text-ink-white"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </Container>

            <nav aria-label="Mobile" className="flex flex-col px-5 py-8 gap-6">
              {navLinks.map((l) => (
                <PrefetchLink
                  key={l.to}
                  to={l.to}
                  end={l.to === '/'}
                  className="heading-editorial text-4xl text-ink-white"
                >
                  {({ isActive }) => (
                    <span aria-current={isActive ? 'page' : undefined}>{l.label}</span>
                  )}
                </PrefetchLink>
              ))}

              <PrefetchLink
                to="/wishlist"
                className="heading-editorial text-4xl text-ink-white inline-flex items-baseline gap-3"
              >
                <span>Wishlist</span>
                {wishlistCount > 0 && (
                  <span className="text-base uppercase tracking-editorial text-ink-dim tabular-nums">
                    ({wishlistCount})
                  </span>
                )}
              </PrefetchLink>

              <PrefetchLink
                to={user ? '/profile' : '/login'}
                className="heading-editorial text-4xl text-ink-white"
              >
                {user ? 'Profile' : 'Login'}
              </PrefetchLink>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
