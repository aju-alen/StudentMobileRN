/** Single source of truth for the production site URL and canonical base */
export const CANONICAL_SITE_URL = "https://www.coachacadem.ae/" as const;

/** Origin without trailing slash — for metadataBase, robots host, JSON-LD */
export const CANONICAL_SITE_ORIGIN = "https://www.coachacadem.ae" as const;

export const siteConfig = {
  name: "Coach Academ",
  url: CANONICAL_SITE_URL,
  canonicalUrl: CANONICAL_SITE_URL,
  locale: "en_US",
  twitterHandle: "@coachacadem",
  ogImage:
    "https://coachacademic.s3.ap-southeast-1.amazonaws.com/dummy-image/iphone-community-portrait.png",
  logo: "https://coachacademic.s3.ap-southeast-1.amazonaws.com/dummy-image/logo-circle.png",
} as const;

/** Normalize any coachacadem.ae URL to the canonical www version */
export function normalizeSiteUrl(url: string): string {
  let normalized = url.trim();

  normalized = normalized.replace(
    /^https?:\/\/coachacadem\.ae\/?$/i,
    CANONICAL_SITE_URL
  );
  normalized = normalized.replace(
    /^https?:\/\/www\.coachacadem\.ae\/?$/i,
    CANONICAL_SITE_URL
  );
  normalized = normalized.replace(
    /^https?:\/\/coachacadem\.ae\//i,
    CANONICAL_SITE_URL
  );
  normalized = normalized.replace(
    /^https?:\/\/www\.coachacadem\.ae(?=\/)/i,
    CANONICAL_SITE_ORIGIN
  );

  return normalized;
}

/**
 * Build a canonical URL for a page path.
 * Home (`/` or empty) resolves to `https://www.coachacadem.ae/`.
 */
export function canonicalUrl(path = "/"): string {
  if (!path || path === "/") return CANONICAL_SITE_URL;

  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  return `${CANONICAL_SITE_URL}${normalizedPath}`;
}

/** @deprecated Use canonicalUrl — kept for backwards compatibility */
export const absoluteUrl = canonicalUrl;
