import type {
  FaqItem,
  FeaturedTutor,
  Review,
  WhyParentsReason,
} from '@/lib/subjects/types';

export type SubjectCard = {
  name: string;
  description: string;
  href: string;
  cta: string;
  tutorCount?: number;
};

export type RelatedCurriculum = {
  name: string;
  description: string;
  href: string;
  cta: string;
};

export type CurriculumPageData = {
  slug: string;
  curriculumName: string;
  seo: {
    title: string;
    description: string;
    primaryKeywords: string[];
    secondaryKeywords: string[];
  };
  hero: {
    h1: string;
    supportingCopy: string;
    primaryCta: string;
    primaryCtaHref: string;
    secondaryCta: string;
    secondaryCtaHref: string;
  };
  featuredTutors: {
    title: string;
    lead: string;
    tutors: FeaturedTutor[];
  };
  understanding: {
    title: string;
    paragraphs: string[];
  };
  subjects: {
    title: string;
    lead: string;
    cards: SubjectCard[];
  };
  whyParentsChoose: {
    title: string;
    lead: string;
    reasons: WhyParentsReason[];
  };
  reviews: {
    title: string;
    lead: string;
    items: Review[];
  };
  faq: {
    title: string;
    items: FaqItem[];
  };
  downloadApp: {
    title: string;
    supportingCopy: string;
  };
  relatedCurricula: {
    title: string;
    lead?: string;
    items: RelatedCurriculum[];
  };
};
