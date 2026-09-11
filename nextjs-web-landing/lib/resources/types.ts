export type InlinePart =
  | string
  | {
      type: 'link';
      href: string;
      text: string;
    };

export type ResourceBlock =
  | {
      type: 'paragraph';
      parts: InlinePart[];
    }
  | {
      type: 'bullets';
      items: Array<string | InlinePart[]>;
    };

export type ResourceSection = {
  id: string;
  title: string;
  blocks: ResourceBlock[];
};

export type ResourceCategory = 'Exam Preparation' | 'Parent Guides' | 'Blog';

export type ResourceArticle = {
  slug: string;
  category: ResourceCategory;
  categoryPath: '/exam-preparation' | '/parent-guides' | '/blog';
  title: string;
  description: string;
  primaryKeywords: string[];
  secondaryKeywords?: string[];
  publishedAt: string;
  updatedAt?: string;
  intro: InlinePart[][];
  sections: ResourceSection[];
  closing: InlinePart[][];
};
