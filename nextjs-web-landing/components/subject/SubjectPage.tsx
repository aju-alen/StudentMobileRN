import TopTutorCards from '@/components/TopTutorCards';
import WhyParentsChooseCA from '@/components/WhyParentsChooseCA';
import Testimonials from '@/components/Testimonials';
import DownloadApp from '@/components/DownloadApp';
import FAQ from '@/components/FAQ';
import QRCodeFloater from '@/components/QRCodeFloater';
import SubjectHero from '@/components/subject/SubjectHero';
import SubjectHowTutorsHelp from '@/components/subject/SubjectHowTutorsHelp';
import SubjectCurriculumSection from '@/components/subject/SubjectCurriculumSection';
import RelatedSubjects from '@/components/subject/RelatedSubjects';
import SubjectJsonLd from '@/components/subject/SubjectJsonLd';
import type { SubjectPageData } from '@/lib/subjects/types';

type SubjectPageProps = {
  subject: SubjectPageData;
};

export default function SubjectPage({ subject }: SubjectPageProps) {
  return (
    <>
      <SubjectJsonLd subject={subject} />
      <SubjectHero hero={subject.hero} />
      <TopTutorCards
        id="featured-tutors"
        title={subject.featuredTutors.title}
        lead={subject.featuredTutors.lead}
        tutors={subject.featuredTutors.tutors}
      />
      <SubjectHowTutorsHelp section={subject.howTutorsHelp} />
      {subject.exploreSubjects && (
        <RelatedSubjects
          title={subject.exploreSubjects.title}
          lead={subject.exploreSubjects.lead}
          subjects={subject.exploreSubjects.subjects}
          className="bg-white"
        />
      )}
      <SubjectCurriculumSection
        title={subject.curriculum.title}
        lead={subject.curriculum.lead}
        cards={subject.curriculum.cards}
      />
      <WhyParentsChooseCA
        title={subject.whyParentsChoose.title}
        lead={subject.whyParentsChoose.lead}
        reasons={subject.whyParentsChoose.reasons}
      />
      <Testimonials
        title={subject.reviews.title}
        lead={subject.reviews.lead}
        testimonials={subject.reviews.items}
        showVerifiedNote={false}
      />
      <DownloadApp
        id="download-app"
        title={subject.downloadApp.title}
        supportingCopy={subject.downloadApp.supportingCopy}
      />
      <FAQ title={subject.faq.title} faqs={subject.faq.items} />
      {subject.relatedSubjects && (
        <RelatedSubjects
          title={subject.relatedSubjects.title}
          subjects={subject.relatedSubjects.subjects}
        />
      )}
      <QRCodeFloater />
    </>
  );
}
