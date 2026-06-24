import type { Metadata } from "next";
import {
  CANONICAL_SITE_ORIGIN,
  CANONICAL_SITE_URL,
  canonicalUrl,
  normalizeSiteUrl,
  siteConfig,
} from "./site";
import type { KeywordInput, PageSeoConfig, PageSeoInput } from "./types";

function normalizeKeywords(value: KeywordInput): string[] {
  if (Array.isArray(value)) {
    return value.map((keyword) => keyword.trim()).filter(Boolean);
  }

  return value
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean);
}

function resolveKeywords(input: PageSeoInput): PageSeoConfig {
  const primaryKeywordsList = normalizeKeywords(input.primaryKeywords);
  const secondaryKeywordsList = normalizeKeywords(input.secondaryKeywords ?? []);

  return {
    ...input,
    primaryKeywordsList,
    secondaryKeywordsList,
    allKeywords: [...primaryKeywordsList, ...secondaryKeywordsList],
  };
}

function resolveCanonical(input: PageSeoInput): string {
  if (input.canonicalUrl) {
    return normalizeSiteUrl(input.canonicalUrl);
  }

  return canonicalUrl(input.path ?? "/");
}

/**
 * Build Next.js Metadata from page SEO inputs.
 * Use on any page via: `export const metadata = definePageSeo({ ... })`
 */
export function definePageSeo(input: PageSeoInput): Metadata {
  const config = resolveKeywords(input);
  const canonical = resolveCanonical(config);
  const ogImage = config.ogImage ?? siteConfig.ogImage;

  const title = config.titleAbsolute
    ? { absolute: config.title }
    : config.title;

  return {
    metadataBase: new URL(CANONICAL_SITE_ORIGIN),
    title,
    description: config.description,
    keywords: config.allKeywords,
    alternates: {
      canonical,
      languages: {
        "en-AE": canonical,
        "x-default": canonical,
      },
    },
    robots: config.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: siteConfig.name,
      title: config.title,
      description: config.description,
      locale: siteConfig.locale,
      images: [
        {
          url: ogImage,
          alt: config.title,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: siteConfig.twitterHandle,
      title: config.title,
      description: config.description,
      images: [ogImage],
    },
    other: {
      "og:url": canonical,
      "primary-keywords": config.primaryKeywordsList.join(", "),
      "secondary-keywords": config.secondaryKeywordsList.join(", "),
    },
  };
}

/** Returns the resolved SEO config — useful for JSON-LD or CMS-driven pages */
export function resolvePageSeo(input: PageSeoInput): PageSeoConfig {
  return resolveKeywords(input);
}
