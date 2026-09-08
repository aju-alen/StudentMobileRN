import { Quote } from 'lucide-react';
import type { Review } from '@/lib/subjects/types';

const defaultTestimonials: Review[] = [
  {
    content:
      "My daughter's IGCSE Chemistry grade went from a 6 to a 9 in one term. Her tutor explained every topic clearly and made revision feel manageable before exams.",
    author: 'Sara Al Mansoori',
    role: 'Parent in Dubai · IGCSE Chemistry',
  },
  {
    content:
      'We needed an IB Math tutor who understood the pressure of Predicted Grades. CoachAcadem matched us quickly, and my son finally feels confident going into assessments.',
    author: 'James Whitfield',
    role: 'Parent in Abu Dhabi · IB Mathematics',
  },
  {
    content:
      'Booking A-Level Physics support for my teenager took minutes. The tutor is verified, patient, and sends clear progress updates after every lesson.',
    author: 'Fatima Rahman',
    role: 'Parent in Sharjah · A-Level Physics',
  },
];

const TestimonialCard = ({ testimonial }: { testimonial: Review }) => (
  <div className="flex flex-col bg-gray-50 rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 shadow-sm h-full w-full min-w-0">
    <Quote className="text-indigo-200 h-8 w-8 sm:h-10 sm:w-10 mb-3 sm:mb-4 flex-shrink-0" />

    <blockquote className="text-base sm:text-lg text-gray-700 font-medium leading-relaxed mb-4 sm:mb-6 flex-grow">
      &ldquo;{testimonial.content}&rdquo;
    </blockquote>

    <div className="mt-auto min-w-0">
      <div className="font-semibold text-gray-900 text-sm sm:text-base truncate">
        {testimonial.author}
      </div>
      <div className="text-gray-500 text-xs sm:text-sm leading-snug">
        {testimonial.role}
      </div>
    </div>
  </div>
);

type TestimonialsProps = {
  title?: string;
  lead?: string;
  testimonials?: Review[];
  showVerifiedNote?: boolean;
  verifiedNote?: string;
};

export default function Testimonials({
  title = 'Experiences shared across the UAE',
  lead,
  testimonials = defaultTestimonials,
  showVerifiedNote = true,
  verifiedNote = 'Verified reviews only.',
}: TestimonialsProps) {
  return (
    <section
      id="testimonials"
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
            {testimonials.map((testimonial) => (
              <TestimonialCard
                key={testimonial.author}
                testimonial={testimonial}
              />
            ))}
          </div>

          <div className="md:hidden -mx-4 px-4">
            <div
              className="flex gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory pb-2 sm:pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              aria-label="Testimonials carousel"
            >
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.author}
                  className="w-[88vw] sm:w-[85vw] max-w-sm flex-shrink-0 snap-center"
                >
                  <TestimonialCard testimonial={testimonial} />
                </div>
              ))}
            </div>
          </div>

          {showVerifiedNote && (
            <div className="text-center px-1 sm:px-0">
              <p className="text-base sm:text-[1.5rem] font-semibold text-gray-900">
                {verifiedNote}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
