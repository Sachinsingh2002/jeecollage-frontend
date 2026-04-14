import React from 'react';
import { Helmet } from 'react-helmet-async';

export const SEO = ({ title, description, keywords, canonical, type = 'website', jsonLd, breadcrumbs }) => {
  const siteName = 'JEEcollege.com';
  const fullTitle = title ? `${title} | ${siteName}` : `${siteName} - Explore JEE Colleges Across India`;
  const defaultDescription = 'Explore 200+ top JEE engineering colleges across 22 Indian states. Compare IITs, NITs, BITS. Check NIRF rankings, fees, placements. JEE rank predictor. Register for personalized counseling.';
  const metaDescription = description || defaultDescription;
  const defaultKeywords = 'engineering colleges India, IIT, NIT, BITS, JEE Main, JEE Advanced, college rankings, NIRF, placements, fees, BTech colleges';

  const breadcrumbLd = breadcrumbs ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((bc, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": bc.name,
      ...(bc.url ? { "item": bc.url } : {})
    }))
  } : null;

  // Merge all JSON-LD into array if multiple
  const allJsonLd = [jsonLd, breadcrumbLd].filter(Boolean);

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={keywords || defaultKeywords} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      {canonical && <link rel="canonical" href={canonical} />}
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <html lang="en" />
      {allJsonLd.map((ld, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(ld)}
        </script>
      ))}
    </Helmet>
  );
};
