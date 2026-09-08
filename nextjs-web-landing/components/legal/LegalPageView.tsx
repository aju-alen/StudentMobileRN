import LegalDocument from '@/components/legal/LegalDocument';
import type { Locale } from '@/lib/i18n/locale';
import { t } from '@/lib/i18n/messages';
import type { LegalChrome } from '@/lib/i18n/legal-chrome';
import type { LegalSection } from '@/lib/legal/types';

type LegalPageViewProps = {
  locale: Locale;
  chrome: LegalChrome;
  sections: LegalSection[];
};

export default function LegalPageView({
  locale,
  chrome,
  sections,
}: LegalPageViewProps) {
  const copy = t(locale);

  return (
    <article className="home-section home-section-spacing bg-white">
      <div className="home-section-inner max-w-4xl">
        <header className="mb-10 sm:mb-12 border-b border-gray-200 pb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#24bcc7] mb-2">
            COACHACADEM
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            {chrome.title}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-4">
            {chrome.subtitle}
          </p>
          <p className="text-base text-gray-600 mb-2">
            {copy.legal.effectiveDate}: {chrome.effectiveDate}
          </p>
          <p className="text-base text-gray-700 leading-relaxed mb-4">
            {chrome.intro}
          </p>
          {chrome.supplemental ? (
            <p className="text-base text-gray-700 leading-relaxed mb-4">
              {chrome.supplemental}
            </p>
          ) : null}
          {locale === 'ar' ? (
            <p className="text-base text-gray-600 leading-relaxed">
              {copy.legal.englishBodyNote}
            </p>
          ) : null}
        </header>

        <nav
          aria-label={copy.legal.toc}
          className="mb-10 sm:mb-12 rounded-xl bg-gray-50 border border-gray-200 p-6 sm:p-8"
        >
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
            {copy.legal.toc}
          </h2>
          <ol className="space-y-2 text-base sm:text-lg">
            {chrome.toc.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="text-[#205072] hover:text-[#24bcc7] hover:underline transition-colors"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <LegalDocument sections={sections} />
      </div>
    </article>
  );
}
