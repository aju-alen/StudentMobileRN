import { Check } from 'lucide-react';

const reasons = [
  {
    title: 'Verified Tutor Profiles',
    items: [
      'Every tutor is verified before appearing on the platform.',
    ],
  },
  {
    title: 'Curriculum Expertise',
    items: [
      'Search by curriculum, subject and academic level.',
    ],
  },
  {
    title: 'Ratings and Reviews',
    items: [
      'Review feedback before booking.',
    ],
  },
  {
    title: 'Instant and Scheduled Booking',
    items: [
      'Book now or schedule later.',
    ],
  },
  {
    title: 'Built-In Communication',
    items: [
      'Communicate through the platform after booking.',
    ],
  },
  {
    title: 'Access Across the UAE',
    items: [
      'Online tutoring available throughout the Emirates.',
    ],
  },
];

const ReasonCard = ({
  title,
  items,
}: {
  title: string;
  items: string[];
}) => (
  <div className="flex flex-col rounded-xl sm:rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm h-full w-full min-w-0">
    <div className="flex justify-center mb-3 sm:mb-5">
      <span className="inline-block rounded-full bg-gray-100 px-3 py-1 sm:px-4 sm:py-1.5 text-base sm:text-[1.3rem] font-medium text-gray-700 text-center leading-snug">
        {title}
      </span>
    </div>
    <ul className="space-y-3 sm:space-y-4">
      {items.map((item) => (
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
);

const WhyParentsChooseCA = () => {
  const topReasons = reasons.slice(0, 4);
  const bottomReasons = reasons.slice(4);

  return (
    <section className="home-section home-section-spacing bg-white">
      <div className="home-section-inner">
        <h2 className="home-section-title text-3xl sm:text-4xl md:text-5xl !mb-6 sm:!mb-8 md:!mb-10 leading-tight px-1 sm:px-0">
          Why parents choose CoachAcadem
        </h2>
        <p className="home-section-lead text-lg sm:text-[1.5rem] !-mt-2 sm:!-mt-4 !mb-6 sm:!mb-8 md:!mb-10 leading-relaxed">
          A trusted way to find qualified tutors, compare options, and book with
          confidence.
        </p>

        <div className="home-section-stack gap-6 sm:gap-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {topReasons.map((reason) => (
              <ReasonCard key={reason.title} {...reason} />
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-md sm:max-w-2xl lg:max-w-3xl mx-auto w-full">
            {bottomReasons.map((reason) => (
              <ReasonCard key={reason.title} {...reason} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyParentsChooseCA;
