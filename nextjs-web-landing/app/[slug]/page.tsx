import type { Metadata } from 'next';
import SubjectPage from '@/components/subject/SubjectPage';
import ComingSoon from '@/components/ComingSoon';
import { definePageSeo } from '@/lib/seo/create-metadata';
import { formatSubjectSlugTitle } from '@/lib/subjects/format-slug-title';
import {
  getAllSubjectSlugs,
  getSubjectBySlug,
} from '@/lib/subjects/get-subject';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = true;

export async function generateStaticParams() {
  return getAllSubjectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const subject = getSubjectBySlug(slug);

  if (!subject) {
    const pageTitle = formatSubjectSlugTitle(slug);

    return definePageSeo({
      title: `${pageTitle} — Coming Soon`,
      description: `${pageTitle} page is coming soon on CoachAcadem. Browse verified tutors, compare qualifications, and book lessons online.`,
      primaryKeywords: [pageTitle],
      path: `/${slug}`,
      titleAbsolute: true,
    });
  }

  return definePageSeo({
    title: subject.seo.title,
    description: subject.seo.description,
    primaryKeywords: subject.seo.primaryKeywords,
    secondaryKeywords: subject.seo.secondaryKeywords,
    path: `/${subject.slug}`,
    titleAbsolute: true,
  });
}

export default async function SubjectRoutePage({ params }: PageProps) {
  const { slug } = await params;
  const subject = getSubjectBySlug(slug);

  if (!subject) {
    return <ComingSoon slug={slug} />;
  }

  return <SubjectPage subject={subject} />;
}
