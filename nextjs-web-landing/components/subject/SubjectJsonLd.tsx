import { canonicalUrl } from '@/lib/seo/site';
import type { SubjectPageData } from '@/lib/subjects/types';

type SubjectJsonLdProps = {
  subject: SubjectPageData;
};

export default function SubjectJsonLd({ subject }: SubjectJsonLdProps) {
  const pageUrl = canonicalUrl(`/${subject.slug}`);

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: subject.featuredTutors.title,
    numberOfItems: subject.featuredTutors.tutors.length,
    itemListElement: subject.featuredTutors.tutors.map((tutor, index) => ({
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
    name: subject.hero.h1,
    description: subject.seo.description,
    url: pageUrl,
    mainEntity: itemListSchema,
  };

  const faqPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: subject.faq.items.map((item) => ({
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
