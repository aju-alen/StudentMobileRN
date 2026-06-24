import type { RelatedCurriculum } from '@/lib/curricula/types';

type RelatedCurriculaProps = {
  title: string;
  lead?: string;
  items: RelatedCurriculum[];
};

export default function RelatedCurricula({
  title,
  lead,
  items,
}: RelatedCurriculaProps) {
  return (
    <section className="home-section home-section-spacing bg-gray-50">
      <div className="home-section-inner">
        <h2 className="home-section-title text-3xl sm:text-4xl md:text-5xl !mb-6 sm:!mb-8 md:!mb-10 leading-tight px-1 sm:px-0">
          {title}
        </h2>
        {lead && (
          <p className="home-section-lead text-lg sm:text-[1.5rem] !-mt-2 sm:!-mt-4 !mb-6 sm:!mb-8 md:!mb-10 leading-relaxed">
            {lead}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {items.map((item) => (
            <div
              key={item.href}
              className="flex flex-col p-5 sm:p-6 bg-white rounded-xl shadow border h-full w-full min-w-0"
            >
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                {item.name}
              </h3>
              <p className="text-gray-600 text-base sm:text-[1.1rem] flex-grow mb-4 leading-relaxed">
                {item.description}
              </p>
              <a
                href={item.href}
                className="w-full sm:w-auto sm:self-start text-center bg-[#205072] hover:bg-[#24bcc7] text-white px-4 py-2.5 rounded-lg font-medium transition-colors text-sm sm:text-base"
              >
                {item.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
