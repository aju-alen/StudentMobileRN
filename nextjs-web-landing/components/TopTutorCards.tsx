import { Star } from 'lucide-react';
import type { FeaturedTutor } from '@/lib/subjects/types';

const defaultTutors: FeaturedTutor[] = [
  {
    id: 'sini',
    name: 'Sini',
    photo: 'https://coachacademic.s3.ap-southeast-1.amazonaws.com/users/cmp28kg0o0006qlhdk5fxpgkk/profileImage/photo.webp',
    qualification: 'BA History, University of Oxford',
    subjects: ['History', 'Further History'],
    curricula: ['IGCSE', 'A-Level', 'IB'],
    rating: 4.9,
    reviewCount: 128,
    yearsExperience: 8,
    profileHref: '#tutor-sini',
  },
  {
    id: 'meeno',
    name: 'Meeno',
    photo: 'https://coachacademic.s3.ap-southeast-1.amazonaws.com/users/cmp28hgsw0004qlhdyyztircc/profileImage/photo.webp',
    qualification: 'BSc Physics, Imperial College London',
    subjects: ['Physics', 'Science'],
    curricula: ['IGCSE', 'IB', 'American Curriculum'],
    rating: 4.9,
    reviewCount: 96,
    yearsExperience: 6,
    profileHref: '#tutor-meeno',
  },
  {
    id: 'bonny',
    name: 'Bonny',
    photo: 'https://coachacademic.s3.ap-southeast-1.amazonaws.com/users/cmp28e21v0002qlhdryxmjt6f/profileImage/photo.webp',
    qualification: 'BA English Literature, UAE University',
    subjects: ['English', 'Creative Writing'],
    curricula: ['IGCSE', 'CBSE', 'A-Level'],
    rating: 4.8,
    reviewCount: 84,
    yearsExperience: 5,
    profileHref: '#tutor-fatima-al-zaabi',
  },
];

const TagList = ({ label, items }: { label: string; items: string[] }) => (
  <div>
    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
      {label}
    </p>
    <p className="text-sm text-gray-700">{items.join(', ')}</p>
  </div>
);

const TutorCard = ({ tutor }: { tutor: FeaturedTutor }) => (
  <article className="flex h-full flex-col rounded-xl sm:rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm w-full min-w-0">
    <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
      <img
        src={tutor.photo}
        alt={tutor.name}
        className="h-16 w-16 sm:h-20 sm:w-20 rounded-full object-cover border-2 border-gray-100 flex-shrink-0"
      />
      <div className="min-w-0 flex-1">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
          {tutor.name}
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2 leading-snug">
          {tutor.qualification}
        </p>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2">
          <div className="flex items-center text-yellow-400">
            <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-current" />
            <span className="ml-1 text-xs sm:text-sm font-semibold text-gray-900">
              {tutor.rating.toFixed(1)}
            </span>
          </div>
          <span className="text-xs sm:text-sm text-gray-500">
            ({tutor.reviewCount} reviews)
          </span>
        </div>
      </div>
    </div>

    <div className="space-y-2.5 sm:space-y-3 flex-grow mb-4 sm:mb-6">
      <TagList label="Subjects" items={tutor.subjects} />
      <TagList label="Curricula" items={tutor.curricula} />
      <p className="text-sm text-gray-600">
        <span className="font-semibold text-gray-700">
          {tutor.yearsExperience} years
        </span>{' '}
        teaching experience
      </p>
    </div>

    <a
      href={tutor.profileHref}
      className="block w-full text-center bg-[#205072] hover:bg-[#24bcc7] text-white text-sm font-medium px-4 py-2.5 sm:py-2.5 rounded-lg transition-colors"
    >
      View Tutor Profile
    </a>
  </article>
);

type TopTutorCardsProps = {
  id?: string;
  title?: string;
  lead?: string;
  tutors?: FeaturedTutor[];
};

export default function TopTutorCards({
  id,
  title = 'Featured tutors',
  lead,
  tutors = defaultTutors,
}: TopTutorCardsProps) {
  const displayTutors = tutors.slice(0, 6);

  return (
    <section
      id={id}
      className="home-section home-section-spacing bg-white"
    >
      <div className="home-section-inner">
        <h2 className="home-section-title text-3xl sm:text-4xl md:text-5xl !mb-6 sm:!mb-8 md:!mb-10 leading-tight px-1 sm:px-0">
          {title}
        </h2>
        {lead && (
          <p className="home-section-lead text-lg sm:text-[1.5rem] !-mt-2 sm:!-mt-4 !mb-6 sm:!mb-8 md:!mb-10 leading-relaxed">
            {lead}
          </p>
        )}

        <div className="home-section-stack gap-6 sm:gap-8 max-w-6xl mx-auto w-full">
          <div className="hidden md:grid md:grid-cols-3 gap-4 lg:gap-6">
            {displayTutors.map((tutor) => (
              <TutorCard key={tutor.id} tutor={tutor} />
            ))}
          </div>

          <div className="md:hidden -mx-4 px-4">
            <div className="flex gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory pb-2 sm:pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {displayTutors.map((tutor) => (
                <div
                  key={tutor.id}
                  className="w-[88vw] sm:w-[85vw] max-w-sm shrink-0 snap-center first:pl-0"
                >
                  <TutorCard tutor={tutor} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
