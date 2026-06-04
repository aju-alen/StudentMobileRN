import { Check } from 'lucide-react';

const steps = [
  {
    step: 'Search',
    items: [
      'Browse tutors by subject and curriculum.'
    ],
  },
  {
    step: 'Compare',
    items: [
      'Review qualifications, ratings, reviews, experience and curriculum expertise.',
    ],
  },
  {
    step: 'Book',
    items: [
      'Choose instant booking or schedule a lesson.',
    ],
  },
  {
    step: 'Learn',
    items: [
      'Attend lessons online and continue communication through built-in chat.',
    ],
  },
];

const HowCoachacademWorks = () => {
  return (
    <section className="home-section home-section-spacing bg-white">
      <div className="home-section-inner">
        <h2 className="home-section-title text-3xl sm:text-4xl md:text-5xl !mb-6 sm:!mb-8 md:!mb-10 leading-tight px-1 sm:px-0">
          How CoachAcadem works
        </h2>
        <p className="home-section-lead text-lg sm:text-[1.5rem] !-mt-2 sm:!-mt-4 !mb-6 sm:!mb-8 md:!mb-10 leading-relaxed">
          CoachAcadem helps students and parents discover, compare and book tutors
          through one platform.
        </p>

        <div className="home-section-stack gap-6 sm:gap-8">
        {/* Gradient progress bar with step dots */}
        <div className="relative hidden md:block">
          <div className="h-3 rounded-full bg-[linear-gradient(to_right,#205072,#216B87,#22869D,#24BCC7)]" />
          <div className="absolute inset-0 flex justify-between items-center">
            {steps.map((s) => (
              <div
                key={s.step}
                className="w-5 h-5 rounded-full bg-white shadow-md border-2 border-white"
                aria-hidden
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
          {steps.map((step) => (
            <div
              key={step.step}
              className="flex flex-col rounded-xl sm:rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm w-full min-w-0"
            >
              <div className="flex justify-center mb-3 sm:mb-5 md:hidden">
                <div className="w-5 h-5 rounded-full bg-white shadow-md border-2 border-gray-200" />
              </div>
              <div className="flex justify-center mb-3 sm:mb-5">
                <span className="inline-block rounded-full bg-gray-100 px-3 py-1 sm:px-4 sm:py-1.5 text-base sm:text-[1.5rem] font-medium text-gray-700">
                  {step.step}
                </span>
              </div>
              <ul className="space-y-3 sm:space-y-4">
                {step.items.map((item) => (
                  <li key={item} className="flex gap-2.5 sm:gap-3 text-left">
                    <Check
                      className="mt-0.5 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 text-blue-500"
                      strokeWidth={2.5}
                    />
                    <span className="text-base sm:text-[1.3rem] text-gray-600 leading-relaxed sm:leading-snug">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Mobile progress bar */}
        <div className="h-2.5 sm:h-3 rounded-full bg-[linear-gradient(to_right,#205072,#205072,#205072,#205072)] md:hidden" />
        </div>
      </div>
    </section>
  );
};

export default HowCoachacademWorks;