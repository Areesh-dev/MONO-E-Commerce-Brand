import { Link } from 'react-router-dom';
import { useBranding } from '../../context/BrandingContext';
import { brand } from '../../config/brand';

const IMG_SIZES = {
  sm: 'h-5',
  md: 'h-6 sm:h-7',
  lg: 'h-8 sm:h-10',
  xl: 'h-10 sm:h-12',
};

const TEXT_SIZES = {
  sm: 'text-base',
  md: 'text-lg sm:text-xl',
  lg: 'text-2xl',
  xl: 'text-3xl sm:text-4xl',
};

export default function Logo({ to = '/', size = 'md', className = '', onClick }) {
  const { settings } = useBranding();
  const logoUrl = settings.logo_url;
  const alt = settings.logo_alt || brand.name;

  const content = logoUrl ? (
    <img
      src={logoUrl}
      alt={alt}
      className={`${IMG_SIZES[size]} w-auto object-contain`}
    />
  ) : (
    <span className={`heading-editorial ${TEXT_SIZES[size]} tracking-editorial text-ink-white`}>
      {brand.name}
    </span>
  );

  if (!to) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Link to={to} onClick={onClick} className={className} aria-label={alt}>
      {content}
    </Link>
  );
}