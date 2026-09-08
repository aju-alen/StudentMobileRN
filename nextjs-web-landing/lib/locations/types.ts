import type {
  FaqItem,
  WhyParentsReason,
} from "@/lib/subjects/types";
import type { RelatedCurriculum, SubjectCard } from "@/lib/curricula/types";

export type CityPageData = {
  slug: string;
  cityName: string;
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
  understanding: {
    title: string;
    paragraphs: string[];
  };
  curricula: {
    title: string;
    lead: string;
    cards: SubjectCard[];
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
  faq: {
    title: string;
    items: FaqItem[];
  };
  downloadApp: {
    title: string;
    supportingCopy: string;
  };
  relatedCities: {
    title: string;
    lead: string;
    items: RelatedCurriculum[];
  };
};
