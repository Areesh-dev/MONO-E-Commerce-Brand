import { Helmet } from 'react-helmet-async';
import { brand } from '../../config/brand';

const DEFAULT_IMAGE = `${brand.seo.siteUrl}/og-default.jpg`;

export default function Seo({
  title,
  description,
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  noIndex = false,
  jsonLd,
}) {
  const fullTitle = title ? `${title} | ${brand.name}` : brand.seo.defaultTitle;
  const fullDescription = description || brand.seo.defaultDescription;
  const canonical = url ? `${brand.seo.siteUrl}${url}` : undefined;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      {canonical && <link rel="canonical" href={canonical} />}
      <meta name="robots" content={noIndex ? 'noindex,nofollow' : 'index,follow'} />

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={brand.name} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={image} />
      {canonical && <meta property="og:url" content={canonical} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={image} />

      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}