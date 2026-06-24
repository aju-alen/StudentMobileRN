import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import CurriculumPage from '@/components/curriculum/CurriculumPage';
import { definePageSeo } from '@/lib/seo/create-metadata';
import {
  getAllCurriculumSlugs,
  getCurriculumBySlug,
} from '@/lib/curricula/get-curriculum';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllCurriculumSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const curriculum = getCurriculumBySlug(slug);

  if (!curriculum) {
    return {};
  }

  return definePageSeo({
    title: curriculum.seo.title,
    description: curriculum.seo.description,
    primaryKeywords: curriculum.seo.primaryKeywords,
    secondaryKeywords: curriculum.seo.secondaryKeywords,
    path: `/${curriculum.slug}`,
    titleAbsolute: true,
  });
}

export default async function CurriculumRoutePage({ params }: PageProps) {
  const { slug } = await params;
  const curriculum = getCurriculumBySlug(slug);

  if (!curriculum) {
    notFound();
  }

  return <CurriculumPage curriculum={curriculum} />;
}
