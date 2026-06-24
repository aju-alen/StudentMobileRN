export type FeaturedTutor = {
  id: string;
  name: string;
  photo: string;
  qualification: string;
  subjects: string[];
  curricula: string[];
  rating: number;
  reviewCount: number;
  yearsExperience: number;
  profileHref: string;
};

export type CurriculumCard = {
  title: string;
  description: string;
  href: string;
  cta: string;
  tutorCount?: number;
};

export type Review = {
  content: string;
  author: string;
  role: string;
  avatar: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type RelatedSubject = {
  name: string;
  description: string;
  href: string;
  cta: string;
};

export type WhyParentsReason = {
  title: string;
  description: string;
};

export type SubjectPageData = {
  slug: string;
  subjectName: string;
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
  howTutorsHelp: {
    title: string;
    paragraphs: string[];
  };
  curriculum: {
    title: string;
    lead: string;
    cards: CurriculumCard[];
  };
  exploreSubjects?: {
    title: string;
    lead?: string;
    subjects: RelatedSubject[];
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
  relatedSubjects?: {
    title: string;
    subjects: RelatedSubject[];
  };
};
