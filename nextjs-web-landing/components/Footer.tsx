import { APP_STORE_URL, PLAY_STORE_URL } from '@/lib/constants';
import type { Locale } from '@/lib/i18n/locale';
import { withLocale } from '@/lib/i18n/locale';
import { t } from '@/lib/i18n/messages';
import { getFooterColumns, type FooterColumn } from '@/lib/i18n/nav';

const storeButtons = [
  {
    img: '/assets/download_coach_apple.svg',
    label: 'App Store',
    href: APP_STORE_URL,
  },
  {
    img: '/assets/download_coach_android.svg',
    label: 'Google Play',
    href: PLAY_STORE_URL,
  },
];

const isExternalHref = (href: string) =>
  href.startsWith('http') && !href.startsWith('mailto:');

const FooterNavColumn = ({ label, items }: FooterColumn) => (
  <div className="w-full min-w-0">
    <h3 className="text-[1.3rem] max-md:text-base font-semibold text-white mb-4 max-md:mb-3 uppercase tracking-wide">
      {label}
    </h3>
    <ul className="space-y-2.5 max-md:space-y-2">
      {items.map((item) => (
        <li key={`${label}-${item.label}`}>
          <a
            href={item.href}
            target={isExternalHref(item.href) ? '_blank' : undefined}
            rel={isExternalHref(item.href) ? 'noopener noreferrer' : undefined}
            className="text-gray-400 hover:text-white transition-colors hover:underline text-[1.1rem] max-md:text-base leading-snug"
          >
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  </div>
);

export default function Footer({ locale = 'en' }: { locale?: Locale }) {
  const copy = t(locale);
  const { primary, secondary } = getFooterColumns(locale);

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="home-section home-section-spacing max-md:!py-12">
        <div className="home-section-inner">
          <div className="home-section-stack gap-8 sm:gap-10 lg:gap-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              <div className="lg:col-span-3">
                <div className="flex items-center mb-4 max-md:mb-4 lg:mb-6">
                  <img
                    src="https://coachacademic.s3.ap-southeast-1.amazonaws.com/dummy-image/logo-circle.png"
                    alt="Logo"
                    className="h-8 w-8 flex-shrink-0"
                  />
                  <span className="ms-2 text-xl sm:text-2xl font-bold text-white">
                    Coach Academ
                  </span>
                </div>
                <p className="text-gray-400 leading-relaxed text-base max-md:text-base sm:text-[1.1rem] mb-5 max-md:mb-4">
                  {copy.footer.tagline}
                </p>
                <div className="flex flex-col sm:flex-row justify-start gap-5 md:gap-6 max-md:items-start max-md:gap-4">
                  {storeButtons.map((store) => (
                    <a
                      key={store.label}
                      href={store.href}
                      target={store.href.startsWith('http') ? '_blank' : undefined}
                      rel={
                        store.href.startsWith('http')
                          ? 'noopener noreferrer'
                          : undefined
                      }
                      className="inline-block transition-transform hover:scale-105 max-md:flex max-md:justify-start"
                      aria-label={store.label}
                    >
                      <img
                        src={store.img}
                        alt={store.label}
                        className="h-12 sm:h-14 md:h-16 lg:h-[4.5rem] w-auto max-md:h-11"
                      />
                    </a>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 md:gap-8">
                  {primary.map((column) => (
                    <FooterNavColumn key={column.label} {...column} />
                  ))}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 md:gap-8 pt-6 sm:pt-8 border-t border-gray-800">
                  {secondary.map((column) => (
                    <FooterNavColumn key={column.label} {...column} />
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-6 sm:pt-8">
              <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3 sm:gap-4 text-sm max-md:text-xs text-gray-500">
                <p className="text-center sm:text-left">
                  © {new Date().getFullYear()} CoachAcadem. {copy.footer.rights}
                </p>
                <span
                  className="hidden sm:block h-4 w-px bg-gray-600 flex-shrink-0"
                  aria-hidden
                />
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2">
                  <a
                    href={withLocale('/terms-of-use', locale)}
                    className="hover:text-gray-300 transition-colors"
                  >
                    {copy.footer.terms}
                  </a>
                  <span className="text-gray-600" aria-hidden>
                    |
                  </span>
                  <a
                    href={withLocale('/privacy-policy', locale)}
                    className="hover:text-gray-300 transition-colors"
                  >
                    {copy.footer.privacy}
                  </a>
                  <span className="text-gray-600" aria-hidden>
                    |
                  </span>
                  <a
                    href={withLocale('/child-safeguarding-policy', locale)}
                    className="hover:text-gray-300 transition-colors"
                  >
                    {copy.footer.safeguarding}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
