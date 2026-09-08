import Link from 'next/link';
import StoreDownloadLink from '@/components/StoreDownloadLink';
import { formatSubjectSlugTitle } from '@/lib/subjects/format-slug-title';
import type { Locale } from '@/lib/i18n/locale';
import { t } from '@/lib/i18n/messages';

type ComingSoonProps = {
  slug: string;
  locale?: Locale;
};

export default function ComingSoon({ slug, locale = 'en' }: ComingSoonProps) {
  const pageTitle = formatSubjectSlugTitle(slug);
  const copy = t(locale);
  const homeHref = locale === 'ar' ? '/ar' : '/';

  return (
    <section className="home-section home-section-spacing bg-gradient-to-b from-indigo-50 to-white min-h-[60vh] flex items-center">
      <div className="home-section-inner text-center max-w-2xl mx-auto">
        <p className="text-sm sm:text-base font-semibold uppercase tracking-wide text-[#24bcc7] mb-3">
          {copy.comingSoon.kicker}
        </p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-gray-900 mb-4 leading-tight">
          {pageTitle}
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed">
          {copy.comingSoon.body}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Link
            href={homeHref}
            className="text-center bg-[#205072] hover:bg-[#24bcc7] text-white px-6 py-3 rounded-lg font-medium transition-colors text-base sm:text-lg"
          >
            {copy.comingSoon.home}
          </Link>
          <StoreDownloadLink className="text-center border-2 border-[#205072] text-[#205072] hover:bg-[#205072] hover:text-white px-6 py-3 rounded-lg font-medium transition-colors text-base sm:text-lg">
            {copy.getTheApp}
          </StoreDownloadLink>
        </div>
      </div>
    </section>
  );
}
