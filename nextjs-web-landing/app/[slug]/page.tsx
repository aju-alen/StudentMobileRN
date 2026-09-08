import type { Metadata } from 'next';
import SubjectPage from '@/components/subject/SubjectPage';
import ComingSoon from '@/components/ComingSoon';
import CityLandingPage from '@/components/locations/CityLandingPage';
import { definePageSeo } from '@/lib/seo/create-metadata';
import { formatSubjectSlugTitle } from '@/lib/subjects/format-slug-title';
import {
  getAllSubjectSlugs,
  getSubjectBySlug,
} from '@/lib/subjects/get-subject';
import {
  getAllCityPageSlugs,
  getCityPageBySlug,
} from '@/lib/locations/get-city-page';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = new Set([
    ...getAllSubjectSlugs(),
    ...getAllCityPageSlugs(),
  ]);
  return [...slugs].map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const subject = getSubjectBySlug(slug);

  if (subject) {
    return definePageSeo({
      title: subject.seo.title,
      description: subject.seo.description,
      primaryKeywords: subject.seo.primaryKeywords,
      secondaryKeywords: subject.seo.secondaryKeywords,
      path: `/${subject.slug}`,
      locale: "en",
      titleAbsolute: true,
    });
  }

  const city = getCityPageBySlug(slug);
  if (city) {
    return definePageSeo({
      title: city.seo.title,
      description: city.seo.description,
      primaryKeywords: city.seo.primaryKeywords,
      secondaryKeywords: city.seo.secondaryKeywords,
      path: `/${city.slug}`,
      locale: "en",
      titleAbsolute: true,
      noIndex: true,
    });
  }

  const pageTitle = formatSubjectSlugTitle(slug);

  return definePageSeo({
    title: `${pageTitle} — Coming Soon`,
    description: `${pageTitle} page is coming soon on CoachAcadem. Browse verified tutors, compare qualifications, and book lessons online.`,
    primaryKeywords: [pageTitle],
    path: `/${slug}`,
    locale: "en",
    titleAbsolute: true,
    noIndex: NOINDEX_RESOURCE_SLUGS.has(slug),
  });
}

export default async function SubjectRoutePage({ params }: PageProps) {
  const { slug } = await params;
  const subject = getSubjectBySlug(slug);

  if (subject) {
    return <SubjectPage subject={subject} />;
  }

  const city = getCityPageBySlug(slug);
  if (city) {
    return <CityLandingPage page={city} />;
  }

  return <ComingSoon slug={slug} />;
}
