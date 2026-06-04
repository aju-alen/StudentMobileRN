import { frontendURL } from '../common/ipUrl';
import appStoreBadge from '../assets/app-store.png';
import playStoreBadge from '../assets/app.png';

const APP_STORE_URL =
  'https://apps.apple.com/in/app/coach-academ/id6745173635';
const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.rise.coachacadem&hl=en';

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
  <div className="w-full">
    <h3 className="text-[1.3rem] font-semibold text-white mb-4 uppercase tracking-wide">
      {label}
    </h3>
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={`${label}-${item.label}`}>
          <a
            href={item.href}
            target={isExternalHref(item.href) ? '_blank' : undefined}
            rel={isExternalHref(item.href) ? 'noopener noreferrer' : undefined}
            className=" text-gray-400 hover:text-white transition-colors hover:underline text-[1.1rem]"
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
      <div className="container mx-auto px-4 md:px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-3">
            <div className="flex items-center mb-6">
              <img
                src="https://coachacademic.s3.ap-southeast-1.amazonaws.com/dummy-image/logo-circle.png"
                alt="Logo"
                className="h-8 w-8"
              />
              <span className="ml-2 text-2xl font-bold text-white">
                Coach Academ
              </span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Learn and grow with CoachAcadem.
            </p>
          </div>

          <div className="lg:col-span-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
              {footerRowPrimary.map((column) =>
                column.label === 'Company' ? (
                  <div key={column.label} className="w-full">
                    <FooterNavColumn {...column} />
                    <div className="flex items-center gap-3 mt-5">
                      <a
                        href={APP_STORE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-opacity hover:opacity-80"
                        aria-label="Download on the App Store"
                      >
                        <img
                          src={appStoreBadge}
                          alt="Download on the App Store"
                          className="h-10 w-auto"
                        />
                      </a>
                      <a
                        href={PLAY_STORE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-opacity hover:opacity-80"
                        aria-label="Get it on Google Play"
                      >
                        <img
                          src={playStoreBadge}
                          alt="Get it on Google Play"
                          className="h-10 w-auto"
                        />
                      </a>
                    </div>
                  </div>
                ) : (
                  <FooterNavColumn key={column.label} {...column} />
                )
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mt-6 pt-8 border-t border-gray-800">
              {footerRowSecondary.map((column) => (
                <FooterNavColumn key={column.label} {...column} />
              ))}
            </div>
          </div>

        
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3 sm:gap-4 text-sm text-gray-500">
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
    </footer>
  );
};

export default Footer;