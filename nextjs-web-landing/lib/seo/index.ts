export {
  CANONICAL_SITE_ORIGIN,
  CANONICAL_SITE_URL,
  siteConfig,
  canonicalUrl,
  absoluteUrl,
  normalizeSiteUrl,
} from "./site";
export { definePageSeo, resolvePageSeo } from "./create-metadata";
export type { PageSeoInput, PageSeoConfig, KeywordInput } from "./types";
export { homePageSeo, homeMetadata } from "./pages/home";
