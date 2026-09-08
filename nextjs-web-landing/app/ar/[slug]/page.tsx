import type { Metadata } from 'next';
import SubjectPage from '@/components/subject/SubjectPage';
import CurriculumPage from '@/components/curriculum/CurriculumPage';
import CityLandingPage from '@/components/locations/CityLandingPage';
import ComingSoon from '@/components/ComingSoon';
import { definePageSeo } from '@/lib/seo/create-metadata';
import { formatSubjectSlugTitle } from '@/lib/subjects/format-slug-title';
import { getSubjectBySlug, getAllSubjectSlugs } from '@/lib/subjects/get-subject';
import {
  getAllCurriculumSlugs,
  getCurriculumBySlug,
} from '@/lib/curricula/get-curriculum';
import {
  getAllCityPageSlugs,
  getCityPageBySlug,
} from '@/lib/locations/get-city-page';
import {
  localizeCityPage,
  localizeCurriculum,
  localizeSubject,
} from '@/lib/i18n/localize-page';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = new Set([
    ...getAllSubjectSlugs(),
    ...getAllCurriculumSlugs(),
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
    const localized = localizeSubject(subject, 'ar');
    return definePageSeo({
      title: localized.seo.title,
      description: localized.seo.description,
      primaryKeywords: localized.seo.primaryKeywords,
      secondaryKeywords: localized.seo.secondaryKeywords,
      path: `/ar/${subject.slug}`,
      locale: 'ar',
      titleAbsolute: true,
    });
  }

  const curriculum = getCurriculumBySlug(slug);
  if (curriculum) {
    const localized = localizeCurriculum(curriculum, 'ar');
    return definePageSeo({
      title: localized.seo.title,
      description: localized.seo.description,
      primaryKeywords: localized.seo.primaryKeywords,
      secondaryKeywords: localized.seo.secondaryKeywords,
      path: `/ar/${curriculum.slug}`,
      locale: 'ar',
      titleAbsolute: true,
    });
  }

  const city = getCityPageBySlug(slug);
  if (city) {
    const localized = localizeCityPage(city, 'ar');
    return definePageSeo({
      title: localized.seo.title,
      description: localized.seo.description,
      primaryKeywords: localized.seo.primaryKeywords,
      secondaryKeywords: localized.seo.secondaryKeywords,
      path: `/ar/${city.slug}`,
      locale: 'ar',
      titleAbsolute: true,
    });
  }

  return definePageSeo({
    title: `${formatSubjectSlugTitle(slug)} — قريباً`,
    description: 'هذه الصفحة قيد الإعداد على كوتش أكاديم.',
    primaryKeywords: [formatSubjectSlugTitle(slug)],
    path: `/ar/${slug}`,
    locale: 'ar',
    titleAbsolute: true,
    noIndex: true,
  });
}

export default async function ArabicSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const subject = getSubjectBySlug(slug);
  if (subject) {
    return <SubjectPage subject={localizeSubject(subject, 'ar')} locale="ar" />;
  }

  const curriculum = getCurriculumBySlug(slug);
  if (curriculum) {
    return <CurriculumPage curriculum={localizeCurriculum(curriculum, 'ar')} locale="ar" />;
  }

  const city = getCityPageBySlug(slug);
  if (city) {
    return <CityLandingPage page={localizeCityPage(city, 'ar')} />;
  }

  return <ComingSoon slug={slug} locale="ar" />;
}
