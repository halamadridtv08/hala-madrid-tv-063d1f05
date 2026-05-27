import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
  noIndex?: boolean;
  jsonLd?: object;
  articleBody?: string;
  keywords?: string[];
}

const BASE_URL = 'https://www.hala-madrid-tv.com';
const DEFAULT_IMAGE = 'https://storage.googleapis.com/gpt-engineer-file-uploads/XQxJnbbi65bFpQPLSgRozceUApi1/social-images/social-1759705280620-logo hala madrid tv.png';
const SITE_NAME = 'HALA MADRID TV';
const DEFAULT_DESCRIPTION = 'Toute l\'actualité du Real Madrid : matchs, joueurs, statistiques et transferts. Suivez les Merengues en temps réel.';

export function SEOHead({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  section,
  tags = [],
  noIndex = false,
  jsonLd,
  articleBody,
  keywords
}: SEOHeadProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - Actualités du Real Madrid`;
  const canonicalUrl = url ? `${BASE_URL}${url}` : BASE_URL;
  const wordCount = articleBody ? articleBody.trim().split(/\s+/).filter(Boolean).length : undefined;
  const keywordList = (keywords && keywords.length ? keywords : tags).filter(Boolean);
  const keywordString = keywordList.join(', ');

  // WebSite JSON-LD with SearchAction for Google sitelinks search box
  const webSiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: BASE_URL,
    description: DEFAULT_DESCRIPTION,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: DEFAULT_IMAGE
      },
      sameAs: [
        'https://twitter.com/HalaMadrid360',
        'https://www.instagram.com/halamadrid360',
        'https://www.youtube.com/@HalaMadrid360'
      ]
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    },
    inLanguage: 'fr-FR'
  };

  // Default JSON-LD for the website
  const defaultJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SportsTeam',
    name: 'Real Madrid CF',
    alternateName: 'Los Blancos',
    sport: 'Football',
    url: BASE_URL,
    logo: DEFAULT_IMAGE,
    sameAs: [
      'https://twitter.com/HalaMadrid360',
      'https://www.instagram.com/halamadrid360',
      'https://www.youtube.com/@HalaMadrid360'
    ]
  };

  // Article JSON-LD
  const articleJsonLd = type === 'article' ? {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: title,
    description: description,
    image: {
      '@type': 'ImageObject',
      url: image,
      width: 1200,
      height: 630
    },
    url: canonicalUrl,
    datePublished: publishedTime,
    dateModified: modifiedTime || publishedTime,
    inLanguage: 'fr-FR',
    isAccessibleForFree: true,
    ...(keywordList.length ? { keywords: keywordString } : {}),
    ...(section ? { articleSection: section } : {}),
    ...(wordCount ? { wordCount } : {}),
    ...(articleBody ? { articleBody: articleBody.slice(0, 5000) } : {}),
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '.prose']
    },
    author: {
      '@type': 'Person',
      name: author || SITE_NAME
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: BASE_URL,
      logo: {
        '@type': 'ImageObject',
        url: DEFAULT_IMAGE,
        width: 512,
        height: 512
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl
    }
  } : null;

  // Breadcrumb JSON-LD
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Accueil',
        item: BASE_URL
      },
      ...(section ? [{
        '@type': 'ListItem',
        position: 2,
        name: section,
        item: `${BASE_URL}/${section.toLowerCase()}`
      }] : []),
      ...(title && section ? [{
        '@type': 'ListItem',
        position: 3,
        name: title,
        item: canonicalUrl
      }] : [])
    ]
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      {keywordString && <meta name="keywords" content={keywordString} />}
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'} />
      <meta name="googlebot" content={noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title || SITE_NAME} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="fr_FR" />
      
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      {type === 'article' && section && (
        <meta property="article:section" content={section} />
      )}
      {tags.map((tag, index) => (
        <meta key={index} property="article:tag" content={tag} />
      ))}
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      <meta property="twitter:site" content="@HalaMadrid360" />
      
      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(jsonLd || (type === 'article' ? articleJsonLd : defaultJsonLd))}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbJsonLd)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(webSiteJsonLd)}
      </script>
    </Helmet>
  );
}
