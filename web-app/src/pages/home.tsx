import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';
import AppPromotion from '../components/AppPromotion';
import Courses from '../components/Courses';
import FAQ from '../components/FAQ';
import CallToAction from '../components/CallToAction';
import SEO from '../components/SEO';
import TutorLanguages from '../components/TutorLanguages';
import HowItWorks from '../components/HowItWorks';
import LoveLessonsBanner from '../components/LoveLessonsBanner';
import BecomeTutor from '../components/BecomeTutor';
import QRCodeFloater from '../components/QRCodeFloater';

function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <SEO
        title="Online Tutoring Platform in the UAE"
        description="CoachAcadem is a leading online tutoring platform that provides personalized and effective learning solutions for students of all ages and levels. Find qualified tutors, schedule sessions, and achieve your academic goals."
        name="Coach Academ"
        type="website"
        keywords="online tutoring, UAE tutors, private tutors, academic coaching, math tutors, science tutors, English tutors, homework help, exam preparation"
        author="Coach Academ"
        tags={["online tutoring", "education", "UAE", "private tutors", "academic support"]}
        schema={{
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Coach Academ",
          "url": "https://www.coachacadem.ae",
          "logo": "https://coachacademic.s3.ap-southeast-1.amazonaws.com/dummy-image/logo-circle.png",
          "description": "CoachAcadem is a leading online tutoring platform that provides personalized and effective learning solutions for students of all ages and levels.",
          "foundingDate": "2023",
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "AE",
            "addressRegion": "Dubai"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "availableLanguage": ["English"]
          },
          "sameAs": [
            "https://www.coachacadem.ae",
          ],
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Tutoring Services",
            "itemListElement": [
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Online Math Tutoring"
                }
              },
              {
                "@type": "Offer", 
                "itemOffered": {
                  "@type": "Service",
                  "name": "Online Science Tutoring"
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service", 
                  "name": "Online English Tutoring"
                }
              }
            ]
          }
        }}
        surveyImage="https://coachacademic.s3.ap-southeast-1.amazonaws.com/dummy-image/iphone-community-portrait.png"
        surveyUrl="https://www.coachacadem.ae"
        robotText="index, follow"
        favicon="https://coachacademic.s3.ap-southeast-1.amazonaws.com/dummy-image/logo-circle.png"
        appleTouchIcon="https://coachacademic.s3.ap-southeast-1.amazonaws.com/dummy-image/logo-circle.png"
        themeColor="#3B82F6"
      />
      <Hero />
      <TutorLanguages />
      <HowItWorks />
      {/* <Features /> */}
      <LoveLessonsBanner bgColor="pink">
        <h2 className="text-4xl md:text-6xl font-extrabold text-black mb-4">You’ll love every tutor interaction and the lessons, too.</h2>
        <p className="text-lg md:text-xl text-black/80">That’s a guarantee from us to you. If dissatisfied? Try another tutor for free.</p>
      </LoveLessonsBanner>

      <LoveLessonsBanner bgColor="blue">
        <h2 className="text-4xl md:text-6xl font-extrabold text-black mb-4">Featured in</h2>
        <p className="text-lg md:text-xl text-black/80">The National | Khaleej Times | BBC Middle East | Gulf News | Teach Middle East.</p>
      </LoveLessonsBanner>

      {/* <AppPromotion /> */}
      <BecomeTutor />
      {/* <Courses /> */}
      {/* <Testimonials /> */}
      <FAQ />
      <CallToAction />
      {/* <Footer /> */}
      <QRCodeFloater />
    </div>
  );
}

export default Home;