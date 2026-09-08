import WhyParentsChooseCA from '@/components/WhyParentsChooseCA';
import DownloadApp from '@/components/DownloadApp';
import FAQ from '@/components/FAQ';
import QRCodeFloater from '@/components/QRCodeFloater';
import CurriculumHero from '@/components/curriculum/CurriculumHero';
import CurriculumUnderstanding from '@/components/curriculum/CurriculumUnderstanding';
import CurriculumSubjectSection from '@/components/curriculum/CurriculumSubjectSection';
import RelatedCurricula from '@/components/curriculum/RelatedCurricula';
import CityJsonLd from '@/components/locations/CityJsonLd';
import type { CityPageData } from '@/lib/locations/types';

export default function CityLandingPage({ page }: { page: CityPageData }) {
  return (
    <>
      <CityJsonLd page={page} />
      <CurriculumHero hero={page.hero} />
      <CurriculumUnderstanding section={page.understanding} />
      <CurriculumSubjectSection
        id="curricula"
        title={page.curricula.title}
        lead={page.curricula.lead}
        cards={page.curricula.cards}
      />
      <CurriculumSubjectSection
        title={page.subjects.title}
        lead={page.subjects.lead}
        cards={page.subjects.cards}
      />
      <WhyParentsChooseCA
        title={page.whyParentsChoose.title}
        lead={page.whyParentsChoose.lead}
        reasons={page.whyParentsChoose.reasons}
      />
      <DownloadApp
        id="download-app"
        title={page.downloadApp.title}
        supportingCopy={page.downloadApp.supportingCopy}
      />
      <FAQ title={page.faq.title} faqs={page.faq.items} />
      <RelatedCurricula
        title={page.relatedCities.title}
        lead={page.relatedCities.lead}
        items={page.relatedCities.items}
      />
      <QRCodeFloater />
    </>
  );
}
