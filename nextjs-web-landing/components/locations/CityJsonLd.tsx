import { canonicalUrl } from '@/lib/seo/site';
import FaqJsonLd from '@/components/FaqJsonLd';
import type { CityPageData } from '@/lib/locations/types';

export default function CityJsonLd({ page }: { page: CityPageData }) {
  const pageUrl = canonicalUrl(`/${page.slug}`);

  const collectionPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: page.hero.h1,
    description: page.seo.description,
    url: pageUrl,
    about: {
      '@type': 'Place',
      name: page.cityName,
      containedInPlace: {
        '@type': 'Country',
        name: 'United Arab Emirates',
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionPageSchema),
        }}
      />
      <FaqJsonLd faqs={page.faq.items} />
    </>
  );
}
