import type { Metadata } from 'next';
import Link from 'next/link';
import { definePageSeo } from '@/lib/seo/create-metadata';
import { getAllParentGuideArticles } from '@/lib/resources/parent-guides';
import { getRequestLocale } from '@/lib/i18n/get-request-locale';
import { withLocale } from '@/lib/i18n/locale';
import { t } from '@/lib/i18n/messages';
import { localizeArticle } from '@/lib/i18n/articles';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const copy = t(locale);
  return definePageSeo({
    title:
      locale === 'ar'
        ? 'أدلة الأهالي لعائلات الإمارات | كوتش أكاديم'
        : 'Parent Guides for UAE Families | Coach Academ',
    description: copy.resources.parentGuidesLead,
    primaryKeywords:
      locale === 'ar'
        ? ['أدلة أهالي الإمارات', 'IGCSE أو A-Level أو البكالوريا الدولية']
        : ['IGCSE vs A-Level vs IB UAE', 'parent guides UAE', 'A-Level or IB Dubai'],
    path: withLocale('/parent-guides', locale),
    locale,
    titleAbsolute: true,
  });
}

export default async function ParentGuidesHubPage() {
  const locale = await getRequestLocale();
  const copy = t(locale);
  const articles = getAllParentGuideArticles().map((article) =>
    localizeArticle(article, locale)
  );

  return (
    <section className="home-section home-section-spacing bg-gradient-to-b from-indigo-50 to-white min-h-[60vh]">
      <div className="home-section-inner max-w-3xl">
        <header className="mb-10 sm:mb-12">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#24bcc7] mb-3">
            {copy.resources.kicker}
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-gray-900 mb-4 leading-tight">
            {copy.resources.parentGuidesTitle}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
            {copy.resources.parentGuidesLead}
          </p>
        </header>

        <ul className="space-y-6">
          {articles.map((article) => (
            <li key={article.slug}>
              <Link
                href={withLocale(`/parent-guides/${article.slug}`, locale)}
                className="block rounded-xl border border-gray-200 bg-white p-6 sm:p-8 hover:border-[#24bcc7] transition-colors"
              >
                <p className="text-sm font-semibold uppercase tracking-wide text-[#24bcc7] mb-2">
                  {article.category}
                </p>
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 leading-snug">
                  {article.title}
                </h2>
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                  {article.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
