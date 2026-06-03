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
    <section className="py-12 px-4 md:px-32 bg-white">
      <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
        How CoachAcadem Works
      </h2>
      <p className="text-center text-gray-600 mb-12 md:mb-16 text-lg md:text-2xl max-w-3xl mx-auto">
        CoachAcadem helps students and parents discover, compare and book tutors
        through one platform.
      </p>

      <div className=" mx-auto">
        {/* Gradient progress bar with step dots */}
        <div className="relative mb-8 md:mb-10 hidden md:block">
          <div className="h-3  qrounded-full bg-[linear-gradient(to_right,#205072,#216B87,#22869D,#24BCC7)]" />
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => (
            <div
              key={step.step}
              className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex justify-center mb-5 md:hidden">
                <div className="w-5 h-5 rounded-full bg-white shadow-md border-2 border-gray-200" />
              </div>
              <div className="flex justify-center mb-5">
                <span className="inline-block rounded-full bg-gray-100 px-4 py-1.5 text-[1.5rem] font-medium text-gray-700">
                  {step.step}
                </span>
              </div>
              <ul className="space-y-4">
                {step.items.map((item) => (
                  <li key={item} className="flex gap-3 text-left">
                    <Check
                      className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500"
                      strokeWidth={2.5}
                    />
                    <span className="text-[1.3rem] text-gray-600 leading-snug">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Mobile progress bar */}
        <div className="mt-8 h-3 rounded-full bg-[linear-gradient(to_right,#205072,#205072,#205072,#205072)] md:hidden" />
      </div>
    </section>
  );
};

export default HowCoachacademWorks;