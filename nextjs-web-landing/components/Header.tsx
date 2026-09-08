'use client';

import { useState, useEffect, useRef, type ReactNode } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown } from 'lucide-react';
import StoreDownloadLink from '@/components/StoreDownloadLink';
import type { Locale } from '@/lib/i18n/locale';
import { withLocale } from '@/lib/i18n/locale';
import { t } from '@/lib/i18n/messages';
import { getMainNav } from '@/lib/i18n/nav';
import { APP_STORE_URL } from '@/lib/constants';

type NavDropdownItem = { label: string; href: string };

type NavItem =
  | { label: string; type: 'link'; href: string }
  | { label: string; type: 'dropdown'; items: NavDropdownItem[] };

const mainNav: NavItem[] = [
  {
    label: 'Find Tutors',
    type: 'dropdown',
    items: [
      { label: 'Math Tutors', href: '/mathematics-tutors' },
      { label: 'Physics Tutors', href: '/physics-tutors' },
      { label: 'Chemistry Tutors', href: '/chemistry-tutors' },
      { label: 'Biology Tutors', href: '/biology-tutors' },
      { label: 'English Tutors', href: '/english-tutors' },
      { label: 'Arabic Tutors', href: '/arabic-tutors' },
      { label: 'Economics Tutors', href: '/economics-tutors' },
      { label: 'Accounting Tutors', href: '/accounting-tutors' },
      { label: 'Computer Science Tutors', href: '/computer-science-tutors' },
    ],
  },
  {
    label: 'Curricula',
    type: 'dropdown',
    items: [
      { label: 'IGCSE Tutors', href: '/igcse-tutors' },
      { label: 'GCSE Tutors', href: '/gcse-tutors' },
      { label: 'A-Level Tutors', href: '/a-level-tutors' },
      { label: 'IB Tutors', href: '/ib-tutors' },
      { label: 'American Curriculum Tutors', href: '/american-curriculum-tutors' },
      { label: 'CBSE Tutors', href: '/cbse-tutors' },
    ],
  },
  {
    label: 'How it works',
    type: 'link',
    href: '/#home',
  },
  {
    label: 'Resources',
    type: 'dropdown',
    items: [
      { label: 'Parent Guides', href: '/parent-guides' },
      { label: 'Exam Preparation', href: '/exam-preparation' },
    ],
  },
  {
    label: 'Become a Tutor',
    type: 'link',
    href: APP_STORE_URL,
  },
];

const isExternalHref = (href: string) => href.startsWith('http');

const NavAnchor = ({
  href,
  className,
  onClick,
  children,
}: {
  href: string;
  className: string;
  onClick?: () => void;
  children: ReactNode;
}) => {
  if (isExternalHref(href)) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={onClick}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className} onClick={onClick}>
      {children}
    </Link>
  );
};

const linkClass =
  'whitespace-nowrap text-sm xl:text-base text-black-700 hover:text-indigo-600 font-medium transition-colors';
const dropdownItemClass =
  'block px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-[#205072] font-medium transition-colors whitespace-nowrap';
const mobileDropdownItemClass =
  'text-gray-600 hover:text-indigo-600 font-medium transition-colors';

export default function Header({ locale = 'en' }: { locale?: Locale }) {
  const copy = t(locale);
  const mainNav = getMainNav(locale);
  const homeHref = withLocale('/', locale);
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpenDropdowns, setMobileOpenDropdowns] = useState<
    Record<string, boolean>
  >({});
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMobileDropdown = (label: string) => {
    setMobileOpenDropdowns((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const closeMobileMenu = () => {
    setIsOpen(false);
    setMobileOpenDropdowns({});
  };

  return (
    <header
      className={`sticky top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-3' : 'bg-white py-5'
      }`}
    >
      <div className="px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="mx-auto max-w-[90rem]">
          <div className="flex justify-between items-center gap-3 flex-nowrap">
            <div className="flex items-center min-w-0 gap-3 lg:gap-5 xl:gap-8">
              <Link href={homeHref} aria-label="CoachAcadem home" className="shrink-0">
                <img
                  src="https://coachacademic.s3.ap-southeast-1.amazonaws.com/dummy-image/logo.png"
                  alt="CoachAcadem logo"
                  className="h-14 w-14 sm:h-16 sm:w-16 lg:h-[4.25rem] lg:w-[4.25rem] xl:h-20 xl:w-20"
                />
              </Link>
              <nav
                ref={navRef}
                className="hidden lg:flex items-center gap-3 xl:gap-6 flex-nowrap"
              >
                {mainNav.map((item) =>
                  item.type === 'dropdown' ? (
                    <div key={item.label} className="relative shrink-0">
                      <button
                        type="button"
                        className={`flex items-center gap-0.5 xl:gap-1 ${linkClass}`}
                        onClick={() =>
                          setOpenDropdown((prev) =>
                            prev === item.label ? null : item.label
                          )
                        }
                        aria-expanded={openDropdown === item.label}
                        aria-haspopup="true"
                      >
                        {item.label}
                        <ChevronDown
                          size={16}
                          className={`shrink-0 transition-transform duration-200 ${
                            openDropdown === item.label ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {openDropdown === item.label && (
                        <div className="absolute start-0 top-full mt-2 min-w-[220px] rounded-lg border border-gray-100 bg-white py-2 shadow-lg">
                          {item.items.map((sub) => (
                            <Link
                              key={sub.label}
                              href={sub.href}
                              className={dropdownItemClass}
                              onClick={() => setOpenDropdown(null)}
                            >
                              {sub.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <NavAnchor
                      key={item.label}
                      href={item.href}
                      className={linkClass}
                    >
                      {item.label}
                    </NavAnchor>
                  )
                )}
              </nav>
            </div>

            <div className="hidden lg:block shrink-0">
              <StoreDownloadLink className="bg-[#205072] hover:bg-[#24bcc7] text-white text-sm xl:text-lg px-4 xl:px-5 py-2 rounded-full font-medium transition-colors inline-block whitespace-nowrap">
                {copy.getTheApp}
              </StoreDownloadLink>
            </div>

            <button
              className="lg:hidden text-gray-700"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? copy.closeMenu : copy.openMenu}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {isOpen && (
            <div className="lg:hidden mt-4 py-4 border-t border-gray-100">
              <nav className="flex flex-col space-y-4">
                {mainNav.map((item) =>
                  item.type === 'dropdown' ? (
                    <div key={item.label}>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between text-gray-700 hover:text-indigo-600 font-medium transition-colors"
                        onClick={() => toggleMobileDropdown(item.label)}
                      >
                        {item.label}
                        <ChevronDown
                          size={18}
                          className={`transition-transform duration-200 ${
                            mobileOpenDropdowns[item.label] ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {mobileOpenDropdowns[item.label] && (
                        <div className="mt-2 ms-3 flex flex-col space-y-2 border-s-2 border-gray-100 ps-3">
                          {item.items.map((sub) => (
                            <Link
                              key={sub.label}
                              href={sub.href}
                              className={mobileDropdownItemClass}
                              onClick={closeMobileMenu}
                            >
                              {sub.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <NavAnchor
                      key={item.label}
                      href={item.href}
                      className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
                      onClick={closeMobileMenu}
                    >
                      {item.label}
                    </NavAnchor>
                  )
                )}
                <StoreDownloadLink
                  className="bg-[#205072] hover:bg-[#24bcc7] text-white w-full py-2 rounded-full font-medium transition-colors mt-2 inline-block text-center"
                  onClick={closeMobileMenu}
                >
                  {copy.getTheApp}
                </StoreDownloadLink>
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
