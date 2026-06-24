import type { CurriculumCard } from '@/lib/subjects/types';

type SubjectCurriculumSectionProps = {
  title: string;
  lead: string;
  cards: CurriculumCard[];
};

const badgeClasses = [
  'bg-teal-200 text-teal-900',
  'bg-yellow-200 text-yellow-900',
  'bg-blue-200 text-blue-900',
  'bg-indigo-200 text-indigo-900',
  'bg-purple-200 text-purple-900',
];

const CurriculumCardItem = ({
  card,
  index,
}: {
  card: CurriculumCard;
  index: number;
}) => (
  <div className="border rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 bg-white shadow-sm flex flex-col items-start h-full w-full min-w-0">
    <div className="mb-3 sm:mb-4">
      <span
        className={`inline-block font-bold rounded-lg px-3 py-1 text-base sm:text-lg ${badgeClasses[index % badgeClasses.length]}`}
      >
        {index + 1}
      </span>
    </div>
    <h3 className="text-xl sm:text-2xl font-bold mb-2">{card.title}</h3>
    <p className="text-gray-600 mb-3 sm:mb-4 text-base sm:text-[1.3rem] flex-grow leading-relaxed">
      {card.description}
    </p>
    {card.tutorCount != null && (
      <p className="text-sm text-gray-500 mb-4 sm:mb-6">
        {card.tutorCount} tutors available
      </p>
    )}
    <a
      href={card.href}
      className="w-full sm:w-auto text-center bg-[#205072] hover:bg-[#24bcc7] text-white px-4 py-2.5 sm:py-2 rounded-lg text-sm sm:text-base font-medium transition-colors"
    >
      {card.cta}
    </a>
  </div>
);

export default function SubjectCurriculumSection({
  title,
  lead,
  cards,
}: SubjectCurriculumSectionProps) {
  const topRow = cards.slice(0, 3);
  const bottomRow = cards.slice(3);

  return (
    <section className="home-section home-section-spacing bg-white">
      <div className="home-section-inner">
        <h2 className="home-section-title text-3xl sm:text-4xl md:text-5xl !mb-6 sm:!mb-8 md:!mb-10 leading-tight px-1 sm:px-0">
          {title}
        </h2>
        <p className="home-section-lead text-lg sm:text-[1.5rem] !-mt-2 sm:!-mt-4 !mb-6 sm:!mb-8 md:!mb-10 leading-relaxed">
          {lead}
        </p>

        <div className="home-section-stack gap-6 sm:gap-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {topRow.map((card, index) => (
              <CurriculumCardItem key={card.href} card={card} index={index} />
            ))}
          </div>

          {bottomRow.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto w-full">
              {bottomRow.map((card, index) => (
                <CurriculumCardItem
                  key={card.href}
                  card={card}
                  index={index + 3}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
