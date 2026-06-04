import { frontendURL } from '../common/ipUrl';
import downloadCoachAcademGoogle from '../assets/download_coach_android.svg';
import downloadCoachAcademAppStore from '../assets/download_coach_apple.svg';

const APP_STORE_URL =
  'https://apps.apple.com/in/app/coach-academ/id6745173635';
const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.rise.coachacadem&hl=en';

const storeButtons = [
  {
    img: downloadCoachAcademAppStore,
    label: 'App Store',
    href: APP_STORE_URL,
  },
  {
    img: downloadCoachAcademGoogle,
    label: 'Google Play',
    href: PLAY_STORE_URL,
  },
];

type FooterLink = { label: string; href: string };

type FooterColumn = {
  label: string;
  items: FooterLink[];
};

const slugHref = (label: string) => {
  const slug = label
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const base = frontendURL || '';
  return `${base}/#${slug}`;
};

const footerRowPrimary: FooterColumn[] = [
  {
    label: 'Subjects',
    items: [
      { label: 'Math Tutors', href: slugHref('Math Tutors') },
      { label: 'Physics Tutors', href: slugHref('Physics Tutors') },
      { label: 'Chemistry Tutors', href: slugHref('Chemistry Tutors') },
      { label: 'Biology Tutors', href: slugHref('Biology Tutors') },
      { label: 'English Tutors', href: slugHref('English Tutors') },
      { label: 'Arabic Tutors', href: slugHref('Arabic Tutors') },
      { label: 'Economics Tutors', href: slugHref('Economics Tutors') },
      { label: 'Accounting Tutors', href: slugHref('Accounting Tutors') },
      { label: 'Computer Science Tutors', href: slugHref('Computer Science Tutors') },
    ],
  },
  {
    label: 'Curricula',
    items: [
      { label: 'IGCSE Tutors', href: slugHref('IGCSE Tutors') },
      { label: 'GCSE Tutors', href: slugHref('GCSE Tutors') },
      { label: 'A-Level Tutors', href: slugHref('A-Level Tutors') },
      { label: 'IB Tutors', href: slugHref('IB Tutors') },
      { label: 'American Curriculum Tutors', href: slugHref('American Curriculum Tutors') },
      { label: 'CBSE Tutors', href: slugHref('CBSE Tutors') },
    ],
  },
  {
    label: 'Resources',
    items: [
      { label: 'Parent Guides', href: slugHref('Parent Guides') },
      { label: 'Study Tips', href: slugHref('Study Tips') },
      { label: 'Exam Preparation', href: slugHref('Exam Preparation') },
      { label: 'Blog', href: slugHref('Blog') },
      { label: 'FAQ', href: `${frontendURL || ''}/#faq` },
    ],
  },
  {
    label: 'Company',
    items: [
      { label: 'About ', href: slugHref('About CoachAcadem') },
      { label: 'Contact Us', href: 'mailto:support@coachacadem.ae' },
     
    ],
  },
];

const footerRowSecondary: FooterColumn[] = [
  {
    label: 'Become a Tutor',
    items: [
      { label: 'Become a Tutor', href: 'https://apps.apple.com/in/app/coach-academ/id6745173635' },
    ],
  },
  // {
  //   label: 'Privacy Policy',
  //   items: [
  //     {
  //       label: 'Privacy Policy',
  //       href: 'https://coachacademic.s3.ap-southeast-1.amazonaws.com/EULA+/Privacy+Policy+for+CoachAcadem1.pdf',
  //     },
  //   ],
  // },
  // {
  //   label: 'Terms',
  //   items: [
  //     {
  //       label: 'Terms of Use',
  //       href: 'https://coachacademic.s3.ap-southeast-1.amazonaws.com/EULA+/COACHACADEM_TOU_(EULA).pdf',
  //     },
  //   ],
  // },
];

const isExternalHref = (href: string) =>
  href.startsWith('http') &&
  !(frontendURL && href.includes(frontendURL)) &&
  !href.startsWith('mailto:');

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

const Footer = () => {
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
              <span className="ml-2 text-xl sm:text-2xl font-bold text-white">
                Coach Academ
              </span>
            </div>
            <p className="text-gray-400 leading-relaxed text-base max-md:text-base sm:text-[1.1rem] mb-5 max-md:mb-4">
              Learn and grow with CoachAcadem.
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
              {footerRowPrimary.map((column) => (
                <FooterNavColumn key={column.label} {...column} />
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 md:gap-8 pt-6 sm:pt-8 border-t border-gray-800">
              {footerRowSecondary.map((column) => (
                <FooterNavColumn key={column.label} {...column} />
              ))}
            </div>
          </div>

        </div>

        <div className="border-t border-gray-800 pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3 sm:gap-4 text-sm max-md:text-xs text-gray-500">
            <p className="text-center sm:text-left">
              © {new Date().getFullYear()} CoachAcadem. All rights reserved.
            </p>
            <span
              className="hidden sm:block h-4 w-px bg-gray-600 flex-shrink-0"
              aria-hidden
            />
            <div className="flex items-center gap-4">
            <a
                href="https://www.coachacadem.ae/terms-of-use"
                className="hover:text-gray-300 transition-colors"
              >
                Terms of Use
              </a>
              <span className="text-gray-600" aria-hidden>
                |
              </span>
             
              <a
                href="https://www.coachacadem.ae/privacy-policy"
                className="hover:text-gray-300 transition-colors"
              >
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
        </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;