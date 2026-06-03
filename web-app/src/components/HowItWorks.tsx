
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
  <div className="border rounded-2xl p-8 bg-white shadow-sm flex flex-col items-start h-full">
    <div className="mb-4">
      <span
        className={`inline-block font-bold rounded-lg px-4 py-1 text-lg ${badgeClass}`}
      >
        {step}
      </span>
    </div>
    <h3 className="text-2xl font-bold mb-2">{title}</h3>
    <p className="text-gray-600 mb-6 text-[1.3rem] flex-grow">{description}</p>
    <a href={href} className="bg-[#205072] hover:bg-[#24bcc7] text-white px-4 py-2 rounded-lg">
      {cta}
    </a>
  </div>
);

const HowItWorks = () => {
  const topRow = curriculumCards.slice(0, 3);
  const bottomRow = curriculumCards.slice(3);

  return (
    <section className="py-20 bg-white md:px-32">
      <div className="container mx-auto px-4 md:px-0">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-14">
          Find Tutors by Curriculum
        </h2>
        <p className="text-center text-gray-600 mb-6 text-[1.5rem] pb-16">
          Explore tutors who teach within the curriculum your child follows.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {topRow.map((card) => (
            <CurriculumCard key={card.step} {...card} />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mt-12">
          {bottomRow.map((card) => (
            <CurriculumCard key={card.step} {...card} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
