import Hero from '@/components/Hero';
import TrustScore from '@/components/TrustScore';
import SearchSubjectCirricula from '@/components/SearchSubjectCirricula';
import CirriculamCards from '@/components/HowItWorks';
import SubjectCards from '@/components/TutorLanguages';
import HowCoachacademWorks from '@/components/HowCoachacademWorks';
import TopTutorCards from '@/components/TopTutorCards';
import WhyParentsChooseCA from '@/components/WhyParentsChooseCA';
import Testimonials from '@/components/Testimonials';
import DownloadApp from '@/components/DownloadApp';
import FAQ from '@/components/FAQ';
import FaqJsonLd from '@/components/FaqJsonLd';
import QRCodeFloater from '@/components/QRCodeFloater';
import { homeMetadata } from '@/lib/seo/pages/home';
import { homeFaqs } from '@/lib/seo/pages/home-faqs';
import { getFeaturedTutors } from '@/lib/tutors/get-featured-tutors';

export const metadata = homeMetadata;

export default async function Home() {
  const featuredTutors = await getFeaturedTutors();

  return (
    <>
      <FaqJsonLd faqs={homeFaqs} />
      <Hero />
      <TrustScore />
      <SearchSubjectCirricula />
      <CirriculamCards />
      <SubjectCards />
      <HowCoachacademWorks />
      <TopTutorCards tutors={featuredTutors} />
      <WhyParentsChooseCA />
      <Testimonials />
      <DownloadApp id="download-app" />
      <FAQ faqs={homeFaqs} />
      <QRCodeFloater />
    </>
  );
}
