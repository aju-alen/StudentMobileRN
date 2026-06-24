import type { SubjectPageData } from '@/lib/subjects/types';

type SubjectHowTutorsHelpProps = {
  section: SubjectPageData['howTutorsHelp'];
};

export default function SubjectHowTutorsHelp({
  section,
}: SubjectHowTutorsHelpProps) {
  return (
    <section className="home-section home-section-spacing bg-gray-50">
      <div className="home-section-inner max-w-4xl">
        <h2 className="home-section-title text-3xl sm:text-4xl md:text-5xl !mb-6 sm:!mb-8 leading-tight px-1 sm:px-0">
          {section.title}
        </h2>
        <div className="home-section-stack gap-4 sm:gap-6">
          {section.paragraphs.map((paragraph) => (
            <p
              key={paragraph.slice(0, 40)}
              className="text-base sm:text-[1.3rem] text-gray-600 leading-relaxed text-left"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
