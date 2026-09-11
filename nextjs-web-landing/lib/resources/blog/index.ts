import { completeGuideFindingATutorUae } from '@/lib/resources/blog/complete-guide-finding-a-tutor-uae';
import type { ResourceArticle } from '@/lib/resources/types';

const blogArticles: ResourceArticle[] = [completeGuideFindingATutorUae];

const blogBySlug = Object.fromEntries(
  blogArticles.map((article) => [article.slug, article])
) as Record<string, ResourceArticle>;

export function getAllBlogArticles(): ResourceArticle[] {
  return blogArticles;
}

export function getBlogArticleBySlug(
  slug: string
): ResourceArticle | undefined {
  return blogBySlug[slug];
}

export function getAllBlogSlugs(): string[] {
  return blogArticles.map((article) => article.slug);
}
