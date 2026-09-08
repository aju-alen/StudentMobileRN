import Link from 'next/link';
import type {
  InlinePart,
  ResourceArticle,
  ResourceBlock,
} from '@/lib/resources/types';
import type { Locale } from '@/lib/i18n/locale';
import { withLocale } from '@/lib/i18n/locale';
import { t } from '@/lib/i18n/messages';
import { fill } from '@/lib/i18n/names';
import { localizeArticle } from '@/lib/i18n/articles';

function localizeHref(href: string, locale: Locale) {
  if (href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:')) {
    return href;
  }
  return withLocale(href, locale);
}

function renderParts(parts: InlinePart[], keyPrefix: string, locale: Locale) {
  return parts.map((part, index) => {
    if (typeof part === 'string') {
      return <span key={`${keyPrefix}-${index}`}>{part}</span>;
    }

    return (
      <Link
        key={`${keyPrefix}-${index}`}
        href={localizeHref(part.href, locale)}
        className="text-[#205072] font-medium underline underline-offset-2 hover:text-[#24bcc7] transition-colors"
      >
        {part.text}
      </Link>
    );
  });
}

function renderBlock(block: ResourceBlock, index: number, locale: Locale) {
  if (block.type === 'paragraph') {
    return (
      <p
        key={index}
        className="text-gray-700 leading-relaxed text-base sm:text-lg mb-4 last:mb-0"
      >
        {renderParts(block.parts, `p-${index}`, locale)}
      </p>
    );
  }

  return (
    <ul
      key={index}
      className="list-disc ps-6 space-y-2 mb-4 text-gray-700 text-base sm:text-lg leading-relaxed"
    >
      {block.items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

type ResourceArticleViewProps = {
  article: ResourceArticle;
  locale?: Locale;
};

export default function ResourceArticleView({
  article,
  locale = 'en',
}: ResourceArticleViewProps) {
  const copy = t(locale);
  const localized = localizeArticle(article, locale);
  const publishedLabel = new Date(`${article.publishedAt}T00:00:00`).toLocaleDateString(
    locale === 'ar' ? 'ar-AE' : 'en-AE',
    {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }
  );

  return (
    <article className="home-section home-section-spacing bg-white">
      <div className="home-section-inner max-w-3xl">
        <header className="mb-10 sm:mb-12 border-b border-gray-200 pb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#24bcc7] mb-3">
            <Link
              href={withLocale(article.categoryPath, locale)}
              className="hover:underline underline-offset-2"
            >
              {localized.category}
            </Link>
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            {localized.title}
          </h1>
          <p className="text-base text-gray-500 mb-6">
            {fill(copy.resources.published, { date: publishedLabel })}
          </p>
          {locale === 'ar' ? (
            <p className="text-base text-gray-600 leading-relaxed mb-6">
              {copy.resources.englishBodyNote}
            </p>
          ) : null}
          <div className="space-y-4">
            {article.intro.map((parts, index) => (
              <p
                key={`intro-${index}`}
                className="text-lg sm:text-xl text-gray-700 leading-relaxed"
              >
                {renderParts(parts, `intro-${index}`, locale)}
              </p>
            ))}
          </div>
        </header>

        <div className="space-y-10 sm:space-y-12">
          {article.sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-28"
            >
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-5">
                {section.title}
              </h2>
              <div>
                {section.blocks.map((block, index) =>
                  renderBlock(block, index, locale)
                )}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-12 sm:mt-14 pt-8 border-t border-gray-200 space-y-4">
          {article.closing.map((parts, index) => (
            <p
              key={`closing-${index}`}
              className="text-base sm:text-lg text-gray-700 leading-relaxed"
            >
              {renderParts(parts, `closing-${index}`, locale)}
            </p>
          ))}
        </footer>
      </div>
    </article>
  );
}
