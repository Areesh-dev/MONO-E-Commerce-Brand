import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Quote } from 'lucide-react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import StarRating from './StarRating';
import { fetchMyReviewForProduct, submitReview } from '../../lib/reviews';

const MAX = 2000;
const MIN = 10;

export default function ReviewForm({ open, onClose, productId, productName, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [existing, setExisting] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!open || !productId) return;
    setChecking(true);
    fetchMyReviewForProduct(productId)
      .then(setExisting)
      .catch(() => setExisting(null))
      .finally(() => setChecking(false));
  }, [open, productId]);

  useEffect(() => {
    if (!open) { setRating(0); setText(''); setExisting(null); }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitReview({ productId, rating, reviewText: text });
      toast.success('Review submitted for approval');
      onSubmitted?.();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const remaining = MAX - text.length;
  const tooShort = text.trim().length < MIN;

  return (
    <Modal open={open} onClose={onClose} title="Write a Review" size="lg">
      {checking ? (
        <p className="text-sm text-ink-dim">Checking…</p>
      ) : existing ? (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <Quote className="w-4 h-4 text-ink-soft" strokeWidth={1.5} aria-hidden="true" />
            <p className="text-[10px] uppercase tracking-editorial text-ink-dim">
              Your review on {productName}
            </p>
          </div>

          <div className="border border-ink-line bg-ink-surface p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <StarRating value={existing.rating} size={16} />
              <span
                className={`text-[9px] uppercase tracking-editorial px-2 py-1 border ${
                  existing.status === 'approved'
                    ? 'border-ink-white text-ink-white'
                    : existing.status === 'declined'
                    ? 'border-ink-line text-ink-muted line-through'
                    : 'border-ink-line text-ink-dim'
                }`}
              >
                {existing.status}
              </span>
            </div>
            <p className="text-sm text-ink-text leading-relaxed">{existing.review_text}</p>
          </div>

          <p className="text-[10px] uppercase tracking-editorial text-ink-muted">
            {existing.status === 'pending'
              ? 'Awaiting moderation — you will see it publicly once approved.'
              : existing.status === 'approved'
              ? 'Your review is live.'
              : 'Your review was declined by moderation.'}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-3 text-[10px] uppercase tracking-nav text-ink-dim">
              Your rating
            </label>
            <StarRating
              value={rating}
              size={26}
              interactive
              onChange={setRating}
            />
          </div>

          <div>
            <label
              htmlFor="review-text"
              className="block mb-3 text-[10px] uppercase tracking-nav text-ink-dim"
            >
              Your review
            </label>
            <textarea
              id="review-text"
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, MAX))}
              rows={6}
              required
              minLength={MIN}
              placeholder="What stands out about this piece? Fabric, fit, feel — the details matter."
              className="w-full px-4 py-3 bg-ink-surface border border-ink-line text-ink-white placeholder:text-ink-muted text-sm leading-relaxed focus:border-ink-text focus:outline-none resize-none transition-colors"
            />
            <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-editorial">
              <span className={tooShort ? 'text-ink-muted' : 'text-ink-dim'}>
                {tooShort ? `Min ${MIN} characters` : ' '}
              </span>
              <span className={`tabular-nums ${remaining < 100 ? 'text-ink-soft' : 'text-ink-muted'}`}>
                {text.length} / {MAX}
              </span>
            </div>
          </div>

          <p className="text-[10px] uppercase tracking-editorial text-ink-muted pt-2 border-t border-ink-line">
            Reviews are published after moderation.
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              loading={loading}
              disabled={rating < 1 || tooShort}
            >
              Submit Review
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}