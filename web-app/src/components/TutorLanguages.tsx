// const stats = [
//   { label: 'Qualified tutors Store', value: '1000+', stars: 5 },
//   { label: 'Tutor reviews', value: '4/5-star' },
//   { label: 'Subjects', value: '50+' },
//   { label: 'On the App', value: '4' },
// ];

const languages = [
  {
    name: 'English',
    description:
      'Improve your English with certified English tutors and teachers. Schedule your online lesson and start learning today.',
  },
  {
    name: 'Math',
    description:
      'From tough equations to complex concepts, understand and solve problems. Schedule online sessions with CBSE, GCSE, A-levels, and IB math tutors.',
  },
  {
    name: 'Physics',
    description:
      'Communicate and speak like a native Arab, with polished grammar and clear pronunciation. Schedule your online lesson with an Arabic tutor today.',
  },
  {
    name: 'Chemistry',
    description:
      'Understand biology topics and concepts about life, from molecular biology to microbiology, and ecosystems across IGCSE, GCSE, IB, and A-level curricula. Schedule online classes with Biology tutors.',
  },
  {
    name: 'Biology',
    description:
      'Learn the core concepts of physics, from motion and energy to electricity and quantum mechanics. Get personalised, online guidance for GCSE, IGCSE, IB, A-Level, and EMSAT physics with expert online tutors who simplify ideas to help you excel.',
  },
  {
    name: 'Arabic',
    description:
      'Learn chemistry, from atomic structure and bonding to reactions and biochemistry. Get clear, personalised learning and instructions from chemistry tutors who break down complex topics into simple, online lessons to help you excel in any curriculum.',
  },
  {
    name: 'Economics',
    description:
      'Explore key topics across biology, chemistry, and physics with guided, easy-to-follow lessons, personalised for you with expert science tutors who help and support you across major curricula.',
  },
  {
    name: 'Business Studies',
    description:
      'Build skills in programming, algorithms, and data structures with personalised, step-by-step guidance from computer science tutors who simplify hard-to-understand concepts. Schedule your online classes.',
  },
  {
    name: 'Computer Science',
    description:
      'Understand key principles like supply and demand, market structures, and economic policies through clear, personalised online lessons. Expert economic tutors simplify complex theories to help you excel in your coursework.',
  },
  {
    name: 'Statistics',
    description:
      'Develop a deep understanding of management, marketing, and organisational strategies through personalised online sessions from professional business studies tutors.',
  },
  {
    name: 'Science',
    description:
      'Explore history, geography, civics, and culture through online lessons that connect concepts to real-world issues. Schedule your online classes with Social Studies tutors to learn.',
  },
  {
    name: 'Psychology',
    description:
      'Boost your scores in math, reading, and writing with personalised strategies and practice with SAT tutors who support and help you approach tests with confidence. Schedule your online lessons.',
  },
  {
    name: 'French',
    description:
      'Build your skills in speaking, listening, reading, and writing through engaging, personalised lessons from expert French tutors who will help you with fluency, whether for school, exams, or everyday conversation.',
  },
  {
    name: 'Creative Writing Tutors',
    description:
      'Develop your storytelling, poetry, and writing skills through guidance that sparks creativity with creative writing tutors who help you find your unique voice and strengthen your writing for any project.',
  },
  {
    name: 'Language Tutors',
    description:
      'Enhance your speaking, listening, reading, and writing skills in the language of your choice with language tutors who support your progress at every level. Schedule your online language classes.',
  },
];

const getSubjectSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const getCtaLabel = (name: string) =>
  name.endsWith('Tutors') ? `Find ${name}` : `Find ${name} Tutors`;

const SubjectCards = () => {
  return (
    <section className="home-section home-section-spacing bg-white">
      <div className="home-section-inner">
      {/* <div className="flex flex-wrap justify-between items-center gap-6 sm:gap-8 md:gap-12 mb-8 md:mb-16 min-h-[120px] sm:min-h-[160px] md:min-h-[200px] py-8 sm:py-10 md:py-12 lg:py-16">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="flex flex-col items-center min-w-[120px] sm:min-w-[140px] md:min-w-[160px]"
          >
            <span className="sm:text-xl md:text-5xl font-extrabold text-gray-900 flex items-center">
              {stat.value}
              {stat.stars && (
                <span className="ml-2 sm:ml-3 flex text-yellow-400">
                  {Array.from({ length: stat.stars }).map((_, idx) => (
                    <svg
                      key={idx}
                      className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" />
                    </svg>
                  ))}
                </span>
              )}
            </span>
            <span className="text-gray-500 text-base sm:text-lg md:text-2xl text-center mt-2 sm:mt-3 font-semibold">
              {stat.label}
            </span>
          </div>
        ))}
      </div> */}
      <h2 className="home-section-title text-3xl sm:text-4xl md:text-5xl !mb-6 sm:!mb-8 md:!mb-10 leading-tight px-1 sm:px-0">
        Explore tutors by subject
      </h2>
      <p className="home-section-lead text-lg sm:text-[1.5rem] !-mt-2 sm:!-mt-4 !mb-6 sm:!mb-8 md:!mb-10 leading-relaxed">
        Browse tutors across the most requested subjects on CoachAcadem.
      </p>

      <div className="home-section-stack gap-6 sm:gap-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-6 items-stretch w-full">
        {languages.map((lang, i) => (
          <div
            key={i}
            className="flex flex-col p-5 sm:p-6 bg-gray-50 rounded-xl shadow border h-full min-h-0 sm:min-h-[10rem] w-full min-w-0"
          >
            <div className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2 break-words">
              {lang.name}
            </div>
            <div className="text-gray-600 text-base sm:text-[1.3rem] break-words text-left flex-grow mb-4 leading-relaxed">
              {lang.description}
            </div>
            <a
              href={`#${getSubjectSlug(lang.name)}-tutors`}
              className="w-full sm:w-auto sm:self-start text-center bg-[#205072] hover:bg-[#24bcc7] text-white px-4 py-2.5 sm:py-2 rounded-lg font-medium transition-colors text-sm sm:text-base"
            >
              {getCtaLabel(lang.name)}
            </a>
          </div>
        ))}
      </div>

      <div className="flex justify-start">
        <a
          href="#"
          className="flex items-center text-base sm:text-lg font-medium text-gray-900 hover:underline"
        >
          <span className="text-xl sm:text-2xl mr-2">+</span> Show more
        </a>
      </div>
      </div>
      </div>
    </section>
  );
};

export default SubjectCards;

