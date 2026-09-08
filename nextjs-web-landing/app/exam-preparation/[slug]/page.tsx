import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ArticleJsonLd from '@/components/resources/ArticleJsonLd';
import ResourceArticleView from '@/components/resources/ResourceArticleView';
import { definePageSeo } from '@/lib/seo/create-metadata';
import {
  getAllExamPreparationSlugs,
  getExamPreparationArticleBySlug,
} from '@/lib/resources/exam-preparation';
import { getRequestLocale } from '@/lib/i18n/get-request-locale';
import { withLocale } from '@/lib/i18n/locale';
import { localizeArticle } from '@/lib/i18n/articles';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllExamPreparationSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getExamPreparationArticleBySlug(slug);

  if (!article) {
    return {};
  }

  const locale = await getRequestLocale();
  const localized = localizeArticle(article, locale);

  return definePageSeo({
    title: localized.title,
    description: localized.description,
    primaryKeywords: localized.primaryKeywords,
    secondaryKeywords: localized.secondaryKeywords,
    path: withLocale(`/exam-preparation/${article.slug}`, locale),
    locale,
    titleAbsolute: true,
  });
}

export default async function ExamPreparationArticlePage({
  params,
}: PageProps) {
  const { slug } = await params;
  const article = getExamPreparationArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const locale = await getRequestLocale();

  return (
    <>
      <ArticleJsonLd article={localizeArticle(article, locale)} />
      <ResourceArticleView article={article} locale={locale} />
    </>
  );
}
