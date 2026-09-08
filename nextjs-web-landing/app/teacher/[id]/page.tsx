import Link from 'next/link';
import { definePageSeo } from '@/lib/seo/create-metadata';
import { APP_STORE_URL, PLAY_STORE_URL } from '@/lib/constants';
import OpenTeacherApp from '@/components/OpenTeacherApp';

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;

  return definePageSeo({
    title: 'Teacher Profile',
    description:
      'This teacher profile is available in the Coach Academ app. Open the app and log in to view it.',
    primaryKeywords: ['teacher profile', 'Coach Academ'],
    path: `/teacher/${id}`,
    noIndex: true,
  });
}

export default async function TeacherProfileLinkPage({ params }: PageProps) {
  const { id } = await params;
  const appLink = `coachacadem://teacher/${id}`;

  return (
    <section className="home-section home-section-spacing bg-gradient-to-b from-indigo-50 to-white min-h-[60vh] flex items-center">
      <OpenTeacherApp teacherId={id} />
      <div className="home-section-inner text-center max-w-2xl mx-auto">
        <p className="text-sm sm:text-base font-semibold uppercase tracking-wide text-[#24bcc7] mb-3">
          Coach Academ
        </p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-gray-900 mb-4 leading-tight">
          Open this teacher profile in the app
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed">
          Teacher profiles are only available to logged-in Coach Academ users.
          Open the app to continue, or install it first if you do not have it yet.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <a
            href={appLink}
            className="text-center bg-[#205072] hover:bg-[#24bcc7] text-white px-6 py-3 rounded-lg font-medium transition-colors text-base sm:text-lg"
          >
            Open in App
          </a>
          <Link
            href={APP_STORE_URL}
            className="text-center border-2 border-[#205072] text-[#205072] hover:bg-[#205072] hover:text-white px-6 py-3 rounded-lg font-medium transition-colors text-base sm:text-lg"
          >
            App Store
          </Link>
          <Link
            href={PLAY_STORE_URL}
            className="text-center border-2 border-[#205072] text-[#205072] hover:bg-[#205072] hover:text-white px-6 py-3 rounded-lg font-medium transition-colors text-base sm:text-lg"
          >
            Google Play
          </Link>
        </div>
      </div>
    </section>
  );
}
