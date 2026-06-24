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
import QRCodeFloater from '@/components/QRCodeFloater';
import { homeMetadata } from '@/lib/seo/pages/home';

export const metadata = homeMetadata;

export default function Home() {
  return (
    <>
      <Hero />
      <TrustScore />
      <SearchSubjectCirricula />
      <CirriculamCards />
      <SubjectCards />
      <HowCoachacademWorks />
      <TopTutorCards />
      <WhyParentsChooseCA />
      <Testimonials />
      <DownloadApp />
      <FAQ />
      <QRCodeFloater />
    </>
  );
}
