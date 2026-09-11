import { CANONICAL_SITE_ORIGIN, canonicalUrl } from '@/lib/seo/site';
import type { ResourceArticle } from '@/lib/resources/types';

type ArticleJsonLdProps = {
  article: ResourceArticle;
};

export default function ArticleJsonLd({ article }: ArticleJsonLdProps) {
  const url = canonicalUrl(
    `${article.categoryPath}/${article.slug}`
  );

  const schema = {
    '@context': 'https://schema.org',
    '@type': article.categoryPath === '/blog' ? 'BlogPosting' : 'Article',
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    author: {
      '@type': 'Organization',
      name: 'Coach Academ',
      url: CANONICAL_SITE_ORIGIN,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Coach Academ',
      url: CANONICAL_SITE_ORIGIN,
      logo: {
        '@type': 'ImageObject',
        url: 'https://coachacademic.s3.ap-southeast-1.amazonaws.com/dummy-image/logo-circle.png',
      },
    },
    keywords: [
      ...article.primaryKeywords,
      ...(article.secondaryKeywords ?? []),
    ].join(', '),
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: CANONICAL_SITE_ORIGIN,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: article.category,
        item: canonicalUrl(article.categoryPath),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: article.title,
        item: url,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
    </>
  );
}
