import { S3_BASE } from '@/lib/constants';
import type { SubjectPageData } from '@/lib/subjects/types';

type SubjectHeroProps = {
  hero: SubjectPageData['hero'];
};

export default function SubjectHero({ hero }: SubjectHeroProps) {
  return (
    <section className="home-section !py-0 pb-10 sm:pb-16 md:pb-20 relative overflow-hidden bg-gradient-to-b from-indigo-50 to-white">
      <div className="home-section-inner relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="order-2 lg:order-1 text-left flex flex-col justify-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-[600] mb-3 lg:mb-4 leading-tight">
              {hero.h1}
            </h1>
            <p className="text-lg sm:text-[1.3rem] text-gray-600 mb-6 sm:mb-8 leading-relaxed">
              {hero.supportingCopy}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <a
                href={hero.primaryCtaHref}
                className="text-center bg-[#205072] hover:bg-[#24bcc7] text-white px-6 py-3 rounded-lg font-medium transition-colors text-base sm:text-lg"
              >
                {hero.primaryCta}
              </a>
              <a
                href={hero.secondaryCtaHref}
                className="text-center border-2 border-[#205072] text-[#205072] hover:bg-[#205072] hover:text-white px-6 py-3 rounded-lg font-medium transition-colors text-base sm:text-lg"
              >
                {hero.secondaryCta}
              </a>
            </div>
          </div>

          <div className="order-1 lg:order-2 relative h-[280px] sm:h-[360px] lg:h-[480px] flex items-center justify-center">
            <img
              src={`${S3_BASE}/hero-screenshot-left.png`}
              alt="CoachAcadem app screenshot"
              className="w-full h-full object-contain object-center"
            />
            <div className="absolute -top-10 -right-10 w-40 h-40 sm:w-64 sm:h-64 bg-indigo-100 rounded-full blur-3xl opacity-30" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 sm:w-64 sm:h-64 bg-blue-100 rounded-full blur-3xl opacity-30" />
          </div>
        </div>
      </div>
    </section>
  );
}
