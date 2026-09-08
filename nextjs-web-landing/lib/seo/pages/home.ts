import { definePageSeo } from "../create-metadata";
import { CANONICAL_SITE_URL } from "../site";

/** Home page SEO — edit title, description, and keywords here */
export const homePageSeo = definePageSeo({
  title:
    "Find Online Tutors in the UAE | IGCSE, IB, A-Level & More | CoachAcadem",
  description:
    "Find qualified online tutors across the UAE for IGCSE, IB, A-Level, American Curriculum, CBSE and more. Compare tutor profiles, book lessons, and learn with confidence through CoachAcadem.",
  primaryKeywords: [
    "Online Tutors UAE"
  ],
  secondaryKeywords: [
    "Online Tutoring UAE",
    "Private Tutors UAE",
    "Find Tutors UAE",
    "IGCSE Tutors UAE",
    "IB Tutors UAE",
    "A-Level Tutors UAE"
  ],
  path: "/",
  canonicalUrl: CANONICAL_SITE_URL,
  locale: "en",
  titleAbsolute: true,
});

export const homeMetadata = homePageSeo;
