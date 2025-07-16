import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';
import AppPromotion from '../components/AppPromotion';
import Courses from '../components/Courses';
import FAQ from '../components/FAQ';
import CallToAction from '../components/CallToAction';
import SEO from '../components/SEO';

function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <SEO
          title="CoachAcadem: Online Tutoring Platform"
          description="CoachAcadem is a leading online tutoring platform that provides personalized and effective learning solutions for students of all ages and levels."
          name="CoachAcadem"
          type="Homepage"
          schema={{
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "CoachAcadem",
            "url": "https://www.coachacadem.ae",
            "logo": "https://coachacademic.s3.ap-southeast-1.amazonaws.com/dummy-image/iphone-community-portrait.png",
            "description": "CoachAcadem is a leading online tutoring platform that provides personalized and effective learning solutions for students of all ages and levels.",
            "sameAs": [
              "https://www.coachacadem.ae"
            ]
          }}
          surveyImage="https://coachacademic.s3.ap-southeast-1.amazonaws.com/dummy-image/iphone-community-portrait.png"
          surveyUrl="https://www.coachacadem.ae"
          robotText="index, follow"
        />
      <Hero />
      <Features />
      <AppPromotion />
      <Courses />
      {/* <Testimonials /> */}
      <FAQ />
      <CallToAction />
      {/* <Footer /> */}
    </div>
  );
}

export default Home;