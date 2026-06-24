import type { MetadataRoute } from "next";
import { canonicalUrl } from "@/lib/seo/site";
import { getAllCurriculumSlugs } from "@/lib/curricula/get-curriculum";
import { getAllSubjectSlugs } from "@/lib/subjects/get-subject";

const routes: {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
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
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: canonicalUrl(route.path),
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
