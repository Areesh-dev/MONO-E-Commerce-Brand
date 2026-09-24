import { Link } from 'react-router-dom';
import {
  Instagram,
  Twitter,
  Youtube,
  Music2,
  Facebook,
  Linkedin,
  Github,
  ArrowUpRight,
  ArrowUp,
} from 'lucide-react';
import Container from '../ui/Container';
import Logo from '../ui/Logo';
import { brand } from '../../config/brand';

const socialIconMap = {
  instagram: Instagram,
  twitter: Twitter,
  x: Twitter,
  youtube: Youtube,
  tiktok: Music2,
  facebook: Facebook,
  linkedin: Linkedin,
  github: Github,
};

const navColumns = [
  {
    title: 'Shop',
    links: [
      { label: 'All Products', to: '/products' },
      { label: 'Categories', to: '/categories' },
      { label: 'Search', to: '/search' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'FAQ', to: '/faq' },
      { label: 'Privacy Policy', to: '/privacy-policy' },
      { label: 'Terms of Service', to: '/terms' },
    ],
  },
  {
    title: 'Contact',
    links: [
      { label: brand.contact.email, href: `mailto:${brand.contact.email}` },
      { label: brand.contact.phone, href: `tel:${brand.contact.phone.replace(/\s+/g, '')}` },
      { label: brand.contact.address, plain: true },
    ],
  },
];

function FooterLink({ link }) {
  const baseClass =
    'group inline-flex items-center gap-1 text-sm text-ink-dim hover:text-ink-white transition-colors duration-300';

  if (link.plain) {
    return <span className="text-sm text-ink-muted">{link.label}</span>;
  }

  if (link.to) {
    return (
      <Link to={link.to} className={baseClass}>
        <span className="relative">
          {link.label}
          <span className="absolute left-0 -bottom-0.5 h-px w-0 bg-ink-white transition-all duration-300 group-hover:w-full" />
        </span>
      </Link>
    );
  }

  return (
    <a href={link.href} className={baseClass}>
      <span className="relative">
        {link.label}
        <span className="absolute left-0 -bottom-0.5 h-px w-0 bg-ink-white transition-all duration-300 group-hover:w-full" />
      </span>
    </a>
  );
}

function SocialIcon({ platform, url, Icon }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={platform}
      className="group w-10 h-10 flex items-center justify-center border border-ink-line hover:border-ink-white transition-colors duration-300"
    >
      <Icon
        className="w-4 h-4 text-ink-dim group-hover:text-ink-white transition-colors duration-300"
        strokeWidth={1.5}
        aria-hidden="true"
      />
    </a>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  const socialEntries = Object.entries(brand.social || {})
    .map(([platform, url]) => {
      const Icon = socialIconMap[platform.toLowerCase()];
      return url && Icon ? { platform, url, Icon } : null;
    })
    .filter(Boolean);

  const handleBackToTop = () => {
    if (typeof window === 'undefined') return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-ink border-t border-ink-line mt-20 sm:mt-24">
      <Container className="py-14 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3">
              <span className="block w-6 h-px bg-ink-line" aria-hidden="true" />
              <span className="text-[10px] uppercase tracking-editorial text-ink-muted">
                Est. {year}
              </span>
            </div>

            <div className="mt-4">
              <Logo size="lg" />
            </div>

            <p className="mt-5 text-sm text-ink-dim leading-relaxed max-w-md">
              {brand.description}
            </p>

            {socialEntries.length > 0 && (
              <div className="mt-8 flex flex-wrap items-center gap-2">
                {socialEntries.map(({ platform, url, Icon }) => (
                  <SocialIcon key={platform} platform={platform} url={url} Icon={Icon} />
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-10">
            {navColumns.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <div className="flex items-center gap-2 mb-5">
                  <span className="block w-4 h-px bg-ink-line" aria-hidden="true" />
                  <h2 className="text-[10px] uppercase tracking-editorial text-ink-white">
                    {col.title}
                  </h2>
                </div>
                <ul className="space-y-3 list-none">
                  {col.links.map((link, i) => (
                    <li key={`${col.title}-${i}`}>
                      <FooterLink link={link} />
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
      </Container>

      <div className="border-t border-ink-line bg-ink-card">
        <Container className="py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-editorial text-ink-muted mb-2">
                Join The List
              </p>
              <p className="heading-editorial text-xl sm:text-2xl text-ink-white">
                Get early access to limited drops.
              </p>
            </div>
            <Link
              to="/signup"
              className="group inline-flex items-center gap-2 h-11 px-6 border border-ink-white bg-ink-white text-ink text-xs uppercase tracking-nav font-medium hover:bg-ink hover:text-ink-white transition-colors duration-200 whitespace-nowrap"
            >
              Create Account
              <ArrowUpRight
                className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                strokeWidth={2}
                aria-hidden="true"
              />
            </Link>
          </div>
        </Container>
      </div>

      <div className="relative border-t border-ink-line overflow-hidden select-none" aria-hidden="true">
        <Container className="pt-10 sm:pt-14 pb-0">
          <span className="block heading-editorial text-[26vw] sm:text-[20vw] lg:text-[16vw] leading-[0.78] tracking-tightest text-ink-white/[0.06] text-center whitespace-nowrap">
            {brand.name}
          </span>
        </Container>
      </div>

      <div className="border-t border-ink-line">
        <Container className="py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-[10px] uppercase tracking-editorial text-ink-muted order-2 sm:order-1">
              © {year} {brand.name}. All rights reserved.
            </span>

            <div className="flex items-center gap-5 order-1 sm:order-2">
              <Link
                to="/privacy-policy"
                className="text-[10px] uppercase tracking-editorial text-ink-muted hover:text-ink-white transition-colors duration-200"
              >
                Privacy
              </Link>
              <span className="w-px h-3 bg-ink-line" aria-hidden="true" />
              <Link
                to="/terms"
                className="text-[10px] uppercase tracking-editorial text-ink-muted hover:text-ink-white transition-colors duration-200"
              >
                Terms
              </Link>
              <span className="w-px h-3 bg-ink-line" aria-hidden="true" />
              <button
                onClick={handleBackToTop}
                className="group inline-flex items-center gap-1.5 text-[10px] uppercase tracking-editorial text-ink-muted hover:text-ink-white transition-colors duration-200"
              >
                Back to top
                <ArrowUp
                  className="w-3 h-3 transition-transform duration-300 group-hover:-translate-y-0.5"
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
}