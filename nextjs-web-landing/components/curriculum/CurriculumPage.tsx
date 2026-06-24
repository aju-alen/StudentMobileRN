import TopTutorCards from '@/components/TopTutorCards';
import WhyParentsChooseCA from '@/components/WhyParentsChooseCA';
import Testimonials from '@/components/Testimonials';
import DownloadApp from '@/components/DownloadApp';
import FAQ from '@/components/FAQ';
import QRCodeFloater from '@/components/QRCodeFloater';
import CurriculumHero from '@/components/curriculum/CurriculumHero';
import CurriculumUnderstanding from '@/components/curriculum/CurriculumUnderstanding';
import CurriculumSubjectSection from '@/components/curriculum/CurriculumSubjectSection';
import RelatedCurricula from '@/components/curriculum/RelatedCurricula';
import CurriculumJsonLd from '@/components/curriculum/CurriculumJsonLd';
import type { CurriculumPageData } from '@/lib/curricula/types';

type CurriculumPageProps = {
  curriculum: CurriculumPageData;
};

export default function CurriculumPage({ curriculum }: CurriculumPageProps) {
  return (
    <>
      <CurriculumJsonLd curriculum={curriculum} />
      <CurriculumHero hero={curriculum.hero} />
      <TopTutorCards
        id="featured-tutors"
        title={curriculum.featuredTutors.title}
        lead={curriculum.featuredTutors.lead}
        tutors={curriculum.featuredTutors.tutors}
      />
      <CurriculumUnderstanding section={curriculum.understanding} />
      <CurriculumSubjectSection
        title={curriculum.subjects.title}
        lead={curriculum.subjects.lead}
        cards={curriculum.subjects.cards}
      />
      <WhyParentsChooseCA
        title={curriculum.whyParentsChoose.title}
        lead={curriculum.whyParentsChoose.lead}
        reasons={curriculum.whyParentsChoose.reasons}
      />
      <Testimonials
        title={curriculum.reviews.title}
        lead={curriculum.reviews.lead}
        testimonials={curriculum.reviews.items}
        showVerifiedNote={false}
      />
      <DownloadApp
        id="download-app"
        title={curriculum.downloadApp.title}
        supportingCopy={curriculum.downloadApp.supportingCopy}
      />
      <FAQ title={curriculum.faq.title} faqs={curriculum.faq.items} />
      <RelatedCurricula
        title={curriculum.relatedCurricula.title}
        lead={curriculum.relatedCurricula.lead}
        items={curriculum.relatedCurricula.items}
      />
      <QRCodeFloater />
    </>
  );
}
