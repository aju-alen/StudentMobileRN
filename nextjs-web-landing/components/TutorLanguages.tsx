const languages = [
  {
    name: 'English',
    description:
      'Strong English skills help your child across every subject. If reading comprehension, essay writing, or analysing literature has become a challenge, an English tutor can provide the guidance and practice needed to build confidence.',
  },
  {
    name: 'Math',
    description:
      'Maths can become frustrating when gaps in understanding start to appear. A Mathematics tutor can help your child strengthen core concepts, work through problems with confidence, and feel more prepared for class tests and exams.',
  },
  {
    name: 'Physics',
    description:
      'Physics asks students to explain the world around them through forces, motion, energy, electricity, and matter. When formulas and calculations start feeling disconnected from the theory, a Physics tutor can help bring everything together.',
  },
  {
    name: 'Chemistry',
    description:
      'Many students enjoy Chemistry until topics become more detailed and interconnected. A Chemistry tutor can help make sense of reactions, bonding, equations, and practical concepts so learning feels far less overwhelming.',
  },
  {
    name: 'Biology',
    description:
      'Biology is filled with fascinating ideas, but it also requires students to remember a lot of detail. A Biology tutor can help your child understand complex processes, connect topics more easily, and approach exams with greater confidence.',
  },
  {
    name: 'Arabic',
    description:
      'Arabic can be challenging when reading, writing, grammar, and vocabulary all develop at different speeds. An Arabic tutor can help your child strengthen language skills while becoming more confident using Arabic in school.',
  },
  {
    name: 'Economics',
    description:
      'Economics is about understanding the choices people, businesses, and governments make every day. If theories, graphs, or evaluation questions feel difficult to tackle, an Economics tutor can help make those ideas clearer and easier to apply.',
  },
  {
    name: 'Business Studies',
    description:
      'Business Studies goes beyond memorising theory. Students are expected to analyse situations, think critically, and justify their decisions. A tutor can help your child develop these skills while improving performance in coursework and exams.',
  },
  {
    name: 'Computer Science',
    description:
      'Computer Science often challenges students to think differently. From programming and algorithms to computational thinking, a tutor can help break complex topics into manageable steps and build confidence along the way.',
  },
  {
    name: 'Statistics',
    description:
      'Statistics is about making sense of information, not just working with numbers. If interpreting data, probability, or statistical methods feels confusing, a Statistics tutor can help your child develop stronger analytical skills.',
  },
  {
    name: 'Science',
    description:
      'Science encourages curiosity, investigation, and problem-solving. When topics start moving quickly or concepts feel difficult to connect, a Science tutor can help your child build understanding and stay engaged with the subject.',
  },
  {
    name: 'Psychology',
    description:
      'Psychology explores why people think, behave, and respond the way they do. A tutor can help your child understand key theories, evaluate evidence more effectively, and develop stronger answers for assessments and exams.',
  },
  {
    name: 'French',
    description:
      'Learning French takes time, practice, and the confidence to use the language regularly. A French tutor can help your child improve speaking, listening, reading, and writing skills while making progress feel more natural and enjoyable.',
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

const subjectSlugOverrides: Record<string, string> = {
  Math: 'mathematics-tutors',
};

const getSubjectSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const getSubjectPageHref = (name: string) => {
  if (subjectSlugOverrides[name]) {
    return `/${subjectSlugOverrides[name]}`;
  }

  const baseName = name.replace(/\s+Tutors$/i, '');
  return `/${getSubjectSlug(baseName)}-tutors`;
};

const getCtaLabel = (name: string) =>
  name.endsWith('Tutors') ? `Find ${name}` : `Find ${name} Tutors`;

export default function SubjectCards() {
  return (
    <section className="home-section home-section-spacing bg-white">
      <div className="home-section-inner">
        <h2 className="home-section-title text-3xl sm:text-4xl md:text-5xl !mb-6 sm:!mb-8 md:!mb-10 leading-tight px-1 sm:px-0">
          Explore tutors by subject
        </h2>
        <p className="home-section-lead text-lg sm:text-[1.5rem] !-mt-2 sm:!-mt-4 !mb-6 sm:!mb-8 md:!mb-10 leading-relaxed">
          Browse tutors across the most requested subjects on CoachAcadem.
        </p>

        <div className="home-section-stack gap-6 sm:gap-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-6 items-stretch w-full">
            {languages.map((lang) => (
              <div
                key={lang.name}
                className="flex flex-col p-5 sm:p-6 bg-gray-50 rounded-xl shadow border h-full min-h-0 sm:min-h-[10rem] w-full min-w-0"
              >
                <div className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2 break-words">
                  {lang.name}
                </div>
                <div className="text-gray-600 text-base sm:text-[1.3rem] break-words text-left flex-grow mb-4 leading-relaxed">
                  {lang.description}
                </div>
                <a
                  href={getSubjectPageHref(lang.name)}
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
}
