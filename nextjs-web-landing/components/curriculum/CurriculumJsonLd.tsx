import { canonicalUrl } from '@/lib/seo/site';
import type { CurriculumPageData } from '@/lib/curricula/types';

type CurriculumJsonLdProps = {
  curriculum: CurriculumPageData;
};

export default function CurriculumJsonLd({
  curriculum,
}: CurriculumJsonLdProps) {
  const pageUrl = canonicalUrl(`/${curriculum.slug}`);

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: curriculum.featuredTutors.title,
    numberOfItems: curriculum.featuredTutors.tutors.length,
    itemListElement: curriculum.featuredTutors.tutors.map((tutor, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Person',
        name: tutor.name,
        url: canonicalUrl(tutor.profileHref),
        jobTitle: tutor.qualification,
        knowsAbout: tutor.subjects,
      },
    })),
  };

  const collectionPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: curriculum.hero.h1,
    description: curriculum.seo.description,
    url: pageUrl,
    mainEntity: itemListSchema,
  };

  const faqPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: curriculum.faq.items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionPageSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(itemListSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqPageSchema),
        }}
      />
    </>
  );
}
