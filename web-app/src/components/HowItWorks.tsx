
const curriculumCards = [
  {
    step: 1,
    badgeClass: 'bg-teal-200 text-teal-900',
    title: 'IGCSE',
    description:
      'Explore support across mathematics, sciences, languages, humanities and exam preparation.',
    href: '#igcse-tutors',
    cta: 'Explore IGCSE Tutors',
  },
  {
    step: 2,
    badgeClass: 'bg-yellow-200 text-yellow-900',
    title: 'IB',
    description:
      'Connect with tutors experienced in the demands of the International Baccalaureate programme.',
    href: '#ib-tutors',
    cta: 'Explore IB Tutors',
  },
  {
    step: 3,
    badgeClass: 'bg-blue-200 text-blue-900',
    title: 'A-Level',
    description:
      'Advanced academic support for examination success and university preparation.',
    href: '#a-level-tutors',
    cta: 'Explore A-Level Tutors',
  },
  {
    step: 4,
    badgeClass: 'bg-blue-200 text-blue-900',
    title: 'American Curriculum',
    description:
      'Curriculum-aligned tutoring designed around grade-level expectations.',
    href: '#american-curriculum-tutors',
    cta: 'Explore American Curriculum Tutors',
  },
  {
    step: 5,
    badgeClass: 'bg-blue-200 text-blue-900',
    title: 'CBSE',
    description:
      'Structured support across key subjects with a focus on academic performance.',
    href: '#cbse-tutors',
    cta: 'Explore CBSE Tutors',
  },
];

const CurriculumCard = ({
  step,
  badgeClass,
  title,
  description,
  href,
  cta,
}: (typeof curriculumCards)[number]) => (
  <div className="border rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 bg-white shadow-sm flex flex-col items-start h-full w-full min-w-0">
    <div className="mb-3 sm:mb-4">
      <span
        className={`inline-block font-bold rounded-lg px-3 py-1 text-base sm:text-lg ${badgeClass}`}
      >
        {step}
      </span>
    </div>
    <h3 className="text-xl sm:text-2xl font-bold mb-2">{title}</h3>
    <p className="text-gray-600 mb-4 sm:mb-6 text-base sm:text-[1.3rem] flex-grow leading-relaxed">
      {description}
    </p>
    <a
      href={href}
      className="w-full sm:w-auto text-center bg-[#205072] hover:bg-[#24bcc7] text-white px-4 py-2.5 sm:py-2 rounded-lg text-sm sm:text-base"
    >
      {cta}
    </a>
  </div>
);

const CirriculamCards = () => {
  const topRow = curriculumCards.slice(0, 3);
  const bottomRow = curriculumCards.slice(3);

  return (
    <section className="home-section home-section-spacing bg-white">
      <div className="home-section-inner">
        <h2 className="home-section-title text-3xl sm:text-4xl md:text-5xl !mb-6 sm:!mb-8 md:!mb-10 leading-tight px-1 sm:px-0">
          Find tutors by curriculum
        </h2>
        <p className="home-section-lead text-lg sm:text-[1.5rem] !-mt-2 sm:!-mt-4 !mb-6 sm:!mb-8 md:!mb-10 leading-relaxed">
          Explore tutors who teach within the curriculum your child follows.
        </p>

        <div className="home-section-stack gap-6 sm:gap-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {topRow.map((card) => (
              <CurriculumCard key={card.step} {...card} />
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto w-full">
            {bottomRow.map((card) => (
              <CurriculumCard key={card.step} {...card} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CirriculamCards;
