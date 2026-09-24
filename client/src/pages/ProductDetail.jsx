import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, ArrowLeft, PenLine } from 'lucide-react';
import { toast } from 'sonner';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import SkeletonText from '../components/ui/SkeletonText';
import ErrorState from '../components/ui/ErrorState';
import StarRating from '../components/reviews/StarRating';
import ReviewList from '../components/reviews/ReviewList';
import ReviewForm from '../components/reviews/ReviewForm';
import SizeSelector from '../components/product/SizeSelector';
import Seo from '../components/seo/Seo';
import { fetchProductBySlug } from '../lib/api';
import { fetchProductSizes } from '../lib/sizes';
import { fetchReviewStats } from '../lib/reviews';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import WishlistButton from '../components/product/WishlistButton';
import RelatedProducts from '../components/product/RelatedProducts';

const fmt = (n) =>
  new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(n);

function ProductDetailSkeleton() {
  return (
    <Container className="py-16" aria-busy="true">
      <Skeleton className="h-3 w-32 mb-8" />
      <div className="grid lg:grid-cols-2 gap-12">
        <Skeleton className="aspect-[3/4]" />
        <div className="space-y-5 pt-6">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-32" />
          <SkeletonText lines={4} className="pt-3" />
          <Skeleton className="h-14 w-full mt-8" />
          <div className="grid grid-cols-2 gap-3 mt-6">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        </div>
      </div>
      <span className="sr-only">Loading product</span>
    </Container>
  );
}

export default function ProductDetail() {
  const { slug } = useParams();
  const [state, setState] = useState({ loading: true, error: null, product: null });
  const [stats, setStats] = useState({ count: 0, average: 0 });
  const [sizes, setSizes] = useState([]);
  const [selectedSize, setSelectedSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewsReloadKey, setReviewsReloadKey] = useState(0);
  const { add } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    setState({ loading: true, error: null, product: null });
    setStats({ count: 0, average: 0 });
    setSizes([]);
    setSelectedSize(null);
    setQty(1);

    fetchProductBySlug(slug)
      .then(async (p) => {
        if (!active) return;
        setState({ loading: false, error: null, product: p });
        fetchReviewStats(p.id).then((s) => active && setStats(s)).catch(() => { });
        try {
          const ps = await fetchProductSizes(p.id);
          if (active) setSizes(ps);
        } catch {
          if (active) setSizes([]);
        }
      })
      .catch((e) => active && setState({ loading: false, error: e, product: null }));

    return () => { active = false; };
  }, [slug]);

  const product = state.product;
  const hasSizes = sizes.length > 0;
  const selectedSizeRow = hasSizes ? sizes.find((s) => s.size.id === selectedSize) : null;
  const availableStock = selectedSizeRow
    ? selectedSizeRow.stock
    : product?.stock ?? 0;
  const outOfStock = !hasSizes && product ? product.stock <= 0 : false;
  const canAdd = !outOfStock && (!hasSizes || !!selectedSize) && (hasSizes ? availableStock > 0 : true);

  const handleAdd = async () => {
    if (!user) {
      toast.error('Please sign in to add items');
      navigate('/login', { state: { from: `/products/${slug}` } });
      return;
    }
    if (hasSizes && !selectedSize) {
      toast.error('Please select a size.');
      return;
    }
    if (selectedSizeRow && selectedSizeRow.stock <= 0) {
      toast.error('Selected size is out of stock.');
      return;
    }
    setAdding(true);
    try {
      await add(product, qty, selectedSize);
      toast.success(`${product.name} added to cart`);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setAdding(false);
    }
  };

  const handleReviewClick = () => {
    if (!user) {
      toast.error('Please sign in to write a review');
      navigate('/login', { state: { from: `/products/${slug}` } });
      return;
    }
    setReviewOpen(true);
  };

  if (state.loading) return <ProductDetailSkeleton />;

  if (state.error || !product) {
    return (
      <>
        <Seo title="Product Not Found" noIndex />
        <Container className="py-16">
          <ErrorState
            title="Product not found"
            description="The product you're looking for is unavailable."
            onRetry={() => navigate('/products')}
          />
        </Container>
      </>
    );
  }

  return (
    <>
      <Seo
        title={product.name}
        description={(product.description || '').slice(0, 160)}
        url={`/products/${product.slug}`}
        image={product.image_url || undefined}
        type="product"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          description: product.description,
          image: product.image_url,
          category: product.category?.name,
          offers: {
            '@type': 'Offer',
            price: Number(product.price),
            priceCurrency: 'PKR',
            availability: (product.stock > 0 || hasSizes)
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
          },
        }}
      />

      <Container className="py-10">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-editorial text-ink-dim hover:text-ink-white"
        >
          <ArrowLeft className="w-3 h-3" aria-hidden="true" /> Back to catalog
        </Link>

        <div className="mt-8 grid lg:grid-cols-2 gap-12">
          <div className="bg-ink-card border border-ink-line aspect-[3/4] overflow-hidden">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                fetchpriority="high"
                decoding="async"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-ink-line text-xs uppercase tracking-editorial">
                No image
              </div>
            )}
          </div>

          <div className="lg:pt-6">
            {product.category?.name && (
              <Link
                to={`/categories/${product.category.slug}`}
                className="text-[10px] uppercase tracking-editorial text-ink-dim hover:text-ink-white"
              >
                {product.category.name}
              </Link>
            )}
            <h1 className="heading-editorial text-4xl sm:text-5xl text-ink-white mt-3">
              {product.name}
            </h1>

            {stats.count > 0 && (
              <div className="mt-4 flex items-center gap-3">
                <StarRating value={stats.average} />
                <span className="text-[10px] uppercase tracking-editorial text-ink-dim">
                  {stats.average.toFixed(1)} · {stats.count} review{stats.count === 1 ? '' : 's'}
                </span>
              </div>
            )}

            <div className="mt-4 flex items-center gap-3">
              <span className="text-2xl text-ink-white font-medium tabular-nums">
                {fmt(product.price)}
              </span>
              {product.is_popular && <Badge>Popular</Badge>}
              {outOfStock && <Badge>Sold out</Badge>}
            </div>

            {product.description && (
              <p className="mt-6 text-sm text-ink-dim leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            )}

            {hasSizes && (
              <div className="mt-8 pt-8 border-t border-ink-line">
                <SizeSelector
                  sizes={sizes}
                  value={selectedSize}
                  onChange={setSelectedSize}
                />
              </div>
            )}

            <div className="mt-8 pt-8 border-t border-ink-line">
              <div className="flex items-center gap-6">
                <div className="inline-flex items-center border border-ink-line">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={qty <= 1 || outOfStock || (hasSizes && availableStock === 0)}
                    aria-label="Decrease quantity"
                    className="w-11 h-11 flex items-center justify-center text-ink-text hover:text-ink-white disabled:opacity-30"
                  >
                    <Minus className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <span aria-live="polite" className="w-12 text-center text-sm text-ink-white tabular-nums">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty((q) => Math.min(availableStock, q + 1))}
                    disabled={qty >= availableStock || outOfStock}
                    aria-label="Increase quantity"
                    className="w-11 h-11 flex items-center justify-center text-ink-text hover:text-ink-white disabled:opacity-30"
                  >
                    <Plus className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
                <span className="text-[10px] uppercase tracking-editorial text-ink-dim">
                  {outOfStock
                    ? 'Out of stock'
                    : hasSizes
                      ? (selectedSize ? `${availableStock} in stock` : 'Select a size')
                      : `${product.stock} in stock`}
                </span>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  onClick={handleAdd}
                  disabled={!canAdd}
                  loading={adding}
                  size="lg"
                >
                  {outOfStock
                    ? 'Out of Stock'
                    : hasSizes && !selectedSize
                      ? 'Select a Size'
                      : hasSizes && availableStock <= 0
                        ? 'Size Unavailable'
                        : 'Add to Cart'}
                </Button>
                <Button variant="secondary" size="lg" onClick={handleReviewClick}>
                  <PenLine className="w-4 h-4" aria-hidden="true" /> Write a Review
                </Button>
                <WishlistButton
                  productId={product.id}
                  variant="labeled"
                  size="lg"
                  stopPropagation={false}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-24">
          <RelatedProducts productId={product.id} limit={4} />
        </div>
        <div>
          <ReviewList
            key={reviewsReloadKey}
            productId={product.id}
            eyebrow="Product Reviews"
            title="Customer Feedback"
            limit={6}
          />
        </div>
      </Container>

      <ReviewForm
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        productId={product.id}
        productName={product.name}
        onSubmitted={() => {
          setReviewsReloadKey((k) => k + 1);
          fetchReviewStats(product.id).then(setStats).catch(() => { });
        }}
      />
    </>
  );
}