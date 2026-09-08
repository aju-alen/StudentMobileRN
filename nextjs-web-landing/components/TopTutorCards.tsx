import { Star } from 'lucide-react';
import type { FeaturedTutor } from '@/lib/subjects/types';
import type { Locale } from '@/lib/i18n/locale';
import { t } from '@/lib/i18n/messages';
import { fill } from '@/lib/i18n/names';

const tutorCtaClass =
  'block w-full text-center bg-[#205072] hover:bg-[#24bcc7] text-white text-sm font-medium px-4 py-2.5 sm:py-2.5 rounded-lg transition-colors';

const isCrawlableProfileHref = (href?: string) =>
  Boolean(href && !href.startsWith('#'));

const TagList = ({ label, items }: { label: string; items: string[] }) => {
  if (!items.length) return null;

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
        {label}
      </p>
      <p className="text-sm text-gray-700">{items.join(', ')}</p>
    </div>
  );
};

const TutorCard = ({
  tutor,
  locale = 'en',
}: {
  tutor: FeaturedTutor;
  locale?: Locale;
}) => {
  const copy = t(locale);
  return (
    <article className="flex h-full flex-col rounded-xl sm:rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm w-full min-w-0">
      <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
        {tutor.photo && (
          <img
            src={tutor.photo}
            alt={tutor.name}
            className="h-16 w-16 sm:h-20 sm:w-20 rounded-full object-cover border-2 border-gray-100 flex-shrink-0"
          />
        )}
        <div className="min-w-0 flex-1">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
            {tutor.name}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2 leading-snug">
            {tutor.qualification}
          </p>
          {tutor.rating != null && (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2">
              <div className="flex items-center text-yellow-400">
                <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-current" />
                <span className="ms-1 text-xs sm:text-sm font-semibold text-gray-900">
                  {tutor.rating.toFixed(1)}
                </span>
              </div>
              {tutor.reviewCount != null && (
                <span className="text-xs sm:text-sm text-gray-500">
                  ({fill(copy.topTutors.reviews, { n: tutor.reviewCount })})
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2.5 sm:space-y-3 flex-grow mb-4 sm:mb-6">
        <TagList label={copy.topTutors.subjects} items={tutor.subjects} />
        <TagList label={copy.topTutors.curricula} items={tutor.curricula} />
        {tutor.yearsExperience != null && (
          <p className="text-sm text-gray-600">
            {fill(copy.topTutors.years, { n: tutor.yearsExperience })}
          </p>
        )}
      </div>

      {isCrawlableProfileHref(tutor.profileHref) ? (
        <a href={tutor.profileHref} className={tutorCtaClass}>
          {copy.topTutors.viewProfile}
        </a>
      ) : (
        <button type="button" className={tutorCtaClass}>
          {copy.topTutors.viewProfile}
        </button>
      )}
    </article>
  );
};

type TopTutorCardsProps = {
  id?: string;
  title?: string;
  lead?: string;
  tutors?: FeaturedTutor[];
  locale?: Locale;
};

export default function TopTutorCards({
  id,
  title,
  lead,
  tutors = [],
  locale = 'en',
}: TopTutorCardsProps) {
  const heading = title ?? t(locale).topTutors.title;
  const displayTutors = tutors.slice(0, 6);

  if (!displayTutors.length) {
    return null;
  }

  const desktopGridClass =
    displayTutors.length === 1
      ? 'hidden md:grid md:grid-cols-1 max-w-md mx-auto gap-4 lg:gap-6'
      : 'hidden md:grid md:grid-cols-3 gap-4 lg:gap-6';

  return (
    <section
      id={id}
      className="home-section home-section-spacing bg-white"
    >
      <div className="home-section-inner">
        <h2 className="home-section-title text-3xl sm:text-4xl md:text-5xl !mb-6 sm:!mb-8 md:!mb-10 leading-tight px-1 sm:px-0">
          {heading}
        </h2>
        {lead && (
          <p className="home-section-lead text-lg sm:text-[1.5rem] !-mt-2 sm:!-mt-4 !mb-6 sm:!mb-8 md:!mb-10 leading-relaxed">
            {lead}
          </p>
        )}

        <div className="home-section-stack gap-6 sm:gap-8 max-w-6xl mx-auto w-full">
          <div className={desktopGridClass}>
            {displayTutors.map((tutor) => (
              <TutorCard key={tutor.id} tutor={tutor} locale={locale} />
            ))}
          </div>

          <div className="md:hidden -mx-4 px-4">
            <div className="flex gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory pb-2 sm:pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {displayTutors.map((tutor) => (
                <div
                  key={tutor.id}
                  className="w-[88vw] sm:w-[85vw] max-w-sm shrink-0 snap-center first:ps-0"
                >
                  <TutorCard tutor={tutor} locale={locale} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
