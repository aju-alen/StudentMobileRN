'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Languages } from 'lucide-react';
import { getLocaleFromPath, switchLocalePath } from '@/lib/i18n/locale';

export default function LanguageFloater() {
  const pathname = usePathname() ?? '/';
  const locale = getLocaleFromPath(pathname);
  const next = locale === 'ar' ? 'en' : 'ar';
  const href = switchLocalePath(pathname, next);

  return (
    <Link
      href={href}
      hrefLang={next}
      lang={next}
      aria-label={
        next === 'ar' ? 'Translate to Arabic' : 'Translate to English'
      }
      className="fixed z-[60] bottom-24 left-4 md:bottom-6 md:left-6 inline-flex items-center gap-2 rounded-full bg-[#205072] px-4 py-3 text-white shadow-xl hover:bg-[#24bcc7] transition-colors"
    >
      <Languages className="h-5 w-5 shrink-0" strokeWidth={2.25} />
      <span className="text-sm sm:text-base font-semibold leading-none">
        {next === 'ar' ? 'العربية' : 'English'}
      </span>
    </Link>
  );
}
