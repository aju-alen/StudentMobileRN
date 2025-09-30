import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  name: string;
  type: string;
  schema?: any;
  surveyImage: string;
  surveyUrl: string;
  robotText?: string;
  keywords?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  canonicalUrl?: string;
  alternateLanguages?: { [key: string]: string };
  viewport?: string;
  themeColor?: string;
  manifestUrl?: string;
  appleTouchIcon?: string;
  favicon?: string;
}

export default function SEO({
  title,
  description,
  name,
  type,
  schema,
  surveyImage,
  surveyUrl,
  robotText = 'index, follow',
  keywords,
  author,
  publishedTime,
  modifiedTime,
  section,
  tags,
  canonicalUrl,
  alternateLanguages,
  viewport = 'width=device-width, initial-scale=1.0, maximum-scale=5.0',
  themeColor = '#3B82F6',
  manifestUrl,
  appleTouchIcon,
  favicon
}: SEOProps) {
  
  const fullTitle = `${title} - ${name}`;
  const imageUrl = surveyImage.startsWith('http') ? surveyImage : `${surveyUrl}${surveyImage}`;
  const canonical = canonicalUrl || surveyUrl;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robotText} />
      <meta name="viewport" content={viewport} />
      <meta name="theme-color" content={themeColor} />
      
      {/* Keywords */}
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Author */}
      {author && <meta name="author" content={author} />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonical} />
      
      {/* Favicon and Icons */}
      {favicon && <link rel="icon" type="image/x-icon" href={favicon} />}
      {appleTouchIcon && <link rel="apple-touch-icon" href={appleTouchIcon} />}
      {manifestUrl && <link rel="manifest" href={manifestUrl} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:url" content={surveyUrl} />
      <meta property="og:site_name" content={name} />
      <meta property="og:locale" content="en_US" />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {section && <meta property="article:section" content={section} />}
      {tags && tags.map((tag, index) => (
        <meta key={index} property="article:tag" content={tag} />
      ))}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={name} />
      <meta name="twitter:creator" content={name} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:image:alt" content={`${title} - ${name}`} />
      
      {/* Additional Meta Tags for Better SEO */}
      <meta name="application-name" content={name} />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={name} />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="msapplication-config" content="/browserconfig.xml" />
      <meta name="msapplication-TileColor" content={themeColor} />
      <meta name="msapplication-tap-highlight" content="no" />
      
      {/* Language Alternates */}
      {alternateLanguages && Object.entries(alternateLanguages).map(([lang, url]) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={url} />
      ))}
      
      {/* Structured Data / JSON-LD */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
      
      {/* Preconnect for Performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://coachacademic.s3.ap-southeast-1.amazonaws.com" />
      
      {/* DNS Prefetch for External Resources */}
      <link rel="dns-prefetch" href="//www.google-analytics.com" />
      <link rel="dns-prefetch" href="//www.googletagmanager.com" />
    </Helmet>
  );
}