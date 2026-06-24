import { Quote } from 'lucide-react';
import type { Review } from '@/lib/subjects/types';

const defaultTestimonials: Review[] = [
  {
    content:
      'Coach Academ transformed my learning experience completely. The live Zoom sessions and interactive content made complex topics approachable and engaging.',
    author: 'Emma Thompson',
    role: 'UX Designer',
    avatar:
      'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  },
  {
    content:
      "As someone with a busy schedule, the flexibility of Coach Academ's platform has been a game-changer. I can learn at my own pace while still benefiting from expert instruction.",
    author: 'David Chen',
    role: 'Software Engineer',
    avatar:
      'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  },
  {
    content:
      'The community aspect of Coach Academ sets it apart. Connecting with other learners and getting direct feedback from instructors has accelerated my growth tremendously.',
    author: 'Sophia Rodriguez',
    role: 'Marketing Specialist',
    avatar:
      'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  },
];

const TestimonialCard = ({ testimonial }: { testimonial: Review }) => (
  <div className="flex flex-col bg-gray-50 rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 shadow-sm h-full w-full min-w-0">
    <Quote className="text-indigo-200 h-8 w-8 sm:h-10 sm:w-10 mb-3 sm:mb-4 flex-shrink-0" />

    <blockquote className="text-base sm:text-lg text-gray-700 font-medium leading-relaxed mb-4 sm:mb-6 flex-grow">
      &ldquo;{testimonial.content}&rdquo;
    </blockquote>

    <div className="flex items-center mt-auto min-w-0">
      <img
        src={testimonial.avatar}
        alt={testimonial.author}
        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover mr-3 sm:mr-4 flex-shrink-0"
      />
      <div className="min-w-0">
        <div className="font-semibold text-gray-900 text-sm sm:text-base truncate">
          {testimonial.author}
        </div>
        <div className="text-gray-500 text-xs sm:text-sm leading-snug">
          {testimonial.role}
        </div>
      </div>
    </div>
  </div>
);

type TestimonialsProps = {
  title?: string;
  lead?: string;
  testimonials?: Review[];
  showVerifiedNote?: boolean;
};

export default function Testimonials({
  title = 'Experiences shared across the UAE',
  lead,
  testimonials = defaultTestimonials,
  showVerifiedNote = true,
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
                Verified reviews only.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
