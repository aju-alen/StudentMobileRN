export type KeywordInput = string | string[];

export type PageSeoInput = {
  /** Page `<title>` and OG/Twitter title */
  title: string;
  /** Meta description for search engines and social previews */
  description: string;
  /** Main target keywords for this page (highest priority) */
  primaryKeywords: KeywordInput;
  /** Supporting keywords for this page (lower priority) */
  secondaryKeywords?: KeywordInput;
  /** Route path used for canonical URL, e.g. "/" or "/about" */
  path?: string;
  /** Explicit canonical override — normalized to https://www.coachacadem.ae/ */
  canonicalUrl?: string;
  /** When true, title is used as-is without the layout title template */
  titleAbsolute?: boolean;
  /** Override default share image */
  ogImage?: string;
  /** Set to true to prevent indexing */
  noIndex?: boolean;
};

export type PageSeoConfig = PageSeoInput & {
  primaryKeywordsList: string[];
  secondaryKeywordsList: string[];
  allKeywords: string[];
};
