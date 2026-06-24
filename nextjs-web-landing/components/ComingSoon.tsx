import Link from 'next/link';
import { formatSubjectSlugTitle } from '@/lib/subjects/format-slug-title';

type ComingSoonProps = {
  slug: string;
};

export default function ComingSoon({ slug }: ComingSoonProps) {
  const pageTitle = formatSubjectSlugTitle(slug);

  return (
    <section className="home-section home-section-spacing bg-gradient-to-b from-indigo-50 to-white min-h-[60vh] flex items-center">
      <div className="home-section-inner text-center max-w-2xl mx-auto">
        <p className="text-sm sm:text-base font-semibold uppercase tracking-wide text-[#24bcc7] mb-3">
          Coming Soon
        </p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-gray-900 mb-4 leading-tight">
          {pageTitle}
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed">
          We are preparing this page with verified tutor listings, curriculum
          details, and helpful resources. Check back soon or explore what is
          already available on CoachAcadem.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Link
            href="/"
            className="text-center bg-[#205072] hover:bg-[#24bcc7] text-white px-6 py-3 rounded-lg font-medium transition-colors text-base sm:text-lg"
          >
            Back to Home
          </Link>
          <Link
            href="/#download-app"
            className="text-center border-2 border-[#205072] text-[#205072] hover:bg-[#205072] hover:text-white px-6 py-3 rounded-lg font-medium transition-colors text-base sm:text-lg"
          >
            Get the App
          </Link>
        </div>
      </div>
    </section>
  );
}
