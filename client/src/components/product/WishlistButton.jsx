import { useState } from 'react';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';

const sizeMap = {
  sm: { btn: 'w-8 h-8',   icon: 'w-4 h-4' },
  md: { btn: 'w-10 h-10', icon: 'w-4 h-4' },
  lg: { btn: 'h-11 px-5', icon: 'w-4 h-4' },
};

export default function WishlistButton({
  productId,
  variant = 'icon',       
  size = 'md',
  className = '',
  stopPropagation = true,
}) {
  const { user } = useAuth();
  const { has, toggle } = useWishlist();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const saved = has(productId);
  const dims = sizeMap[size] || sizeMap.md;

  const handleClick = async (e) => {
    if (stopPropagation) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!user) {
      toast.error('Please sign in to save items');
      navigate('/login');
      return;
    }
    setBusy(true);
    try {
      await toggle(productId);
      toast.success(saved ? 'Removed from wishlist' : 'Saved to wishlist');
    } catch (err) {
      toast.error(err.message || 'Could not update wishlist');
    } finally {
      setBusy(false);
    }
  };

  const ariaLabel = saved ? 'Remove from wishlist' : 'Save to wishlist';

  if (variant === 'labeled') {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        aria-pressed={saved}
        aria-label={ariaLabel}
        className={`inline-flex items-center justify-center gap-2 border border-ink-line text-xs uppercase tracking-nav transition-colors disabled:opacity-50 ${dims.btn} ${
          saved ? 'text-ink-white border-ink-white bg-ink-surface' : 'text-ink-text hover:text-ink-white hover:border-ink-white'
        } ${className}`}
      >
        <Heart
          className={dims.icon}
          strokeWidth={1.5}
          fill={saved ? 'currentColor' : 'none'}
          aria-hidden="true"
        />
        {saved ? 'Saved' : 'Save'}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      aria-pressed={saved}
      aria-label={ariaLabel}
      className={`inline-flex items-center justify-center border transition-colors disabled:opacity-50 ${dims.btn} ${
        saved
          ? 'bg-ink/80 border-ink-white text-ink-white'
          : 'bg-ink/60 border-ink-line text-ink-text hover:text-ink-white hover:border-ink-soft'
      } backdrop-blur-sm ${className}`}
    >
      <Heart
        className={dims.icon}
        strokeWidth={1.5}
        fill={saved ? 'currentColor' : 'none'}
        aria-hidden="true"
      />
    </button>
  );
}