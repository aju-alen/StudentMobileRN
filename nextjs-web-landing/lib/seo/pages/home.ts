import { definePageSeo } from "../create-metadata";
import { CANONICAL_SITE_URL } from "../site";

/** Home page SEO — edit title, description, and keywords here */
export const homePageSeo = definePageSeo({
  title:
    "Find Online Tutors in the UAE | IGCSE, IB, A-Level & More | CoachAcadem - Coach Academ",
  description:
    "Coach Academ is an online tutoring platform that helps students find and connect the best online tutors in the UAE. Learn from the comfort of your home.",
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
  titleAbsolute: true,
});

export const homeMetadata = homePageSeo;
