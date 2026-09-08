import type { MetadataRoute } from "next";
import { canonicalUrl } from "@/lib/seo/site";
import { getAllCurriculumSlugs } from "@/lib/curricula/get-curriculum";
import { getAllSubjectSlugs } from "@/lib/subjects/get-subject";
import { getAllCityPageSlugs } from "@/lib/locations/get-city-page";
import { getAllExamPreparationSlugs } from "@/lib/resources/exam-preparation";
import { getAllParentGuideSlugs } from "@/lib/resources/parent-guides";

const routes: {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/privacy-policy", changeFrequency: "monthly", priority: 0.5 },
  { path: "/terms-of-use", changeFrequency: "monthly", priority: 0.5 },
  {
    path: "/child-safeguarding-policy",
    changeFrequency: "monthly",
    priority: 0.5,
  },
  { path: "/exam-preparation", changeFrequency: "weekly", priority: 0.7 },
  ...getAllExamPreparationSlugs().map((slug) => ({
    path: `/exam-preparation/${slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  })),
  { path: "/parent-guides", changeFrequency: "weekly", priority: 0.7 },
  ...getAllParentGuideSlugs().map((slug) => ({
    path: `/parent-guides/${slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  })),
  ...getAllSubjectSlugs().map((slug) => ({
    path: `/${slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  })),
  ...getAllCurriculumSlugs().map((slug) => ({
    path: `/${slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  })),
  ...getAllCityPageSlugs().map((slug) => ({
    path: `/${slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  })),
  { path: "/ar", changeFrequency: "weekly", priority: 0.9 },
  { path: "/ar/privacy-policy", changeFrequency: "monthly", priority: 0.4 },
  { path: "/ar/terms-of-use", changeFrequency: "monthly", priority: 0.4 },
  {
    path: "/ar/child-safeguarding-policy",
    changeFrequency: "monthly",
    priority: 0.4,
  },
  { path: "/ar/exam-preparation", changeFrequency: "weekly", priority: 0.6 },
  ...getAllExamPreparationSlugs().map((slug) => ({
    path: `/ar/exam-preparation/${slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  })),
  { path: "/ar/parent-guides", changeFrequency: "weekly", priority: 0.6 },
  ...getAllParentGuideSlugs().map((slug) => ({
    path: `/ar/parent-guides/${slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  })),
  ...getAllSubjectSlugs().map((slug) => ({
    path: `/ar/${slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  })),
  ...getAllCurriculumSlugs().map((slug) => ({
    path: `/ar/${slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  })),
  ...getAllCityPageSlugs().map((slug) => ({
    path: `/ar/${slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  })),
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: canonicalUrl(route.path),
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
