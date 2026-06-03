import BecomeTutor from '../components/BecomeTutor';
import CallToAction from '../components/CallToAction';
import FAQ from '../components/FAQ';
import Header from '../components/Header';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import LoveLessonsBanner from '../components/LoveLessonsBanner';
import QRCodeFloater from '../components/QRCodeFloater';
import SEO from '../components/SEO';
import TutorLanguages from '../components/TutorLanguages';
import TrustScore from '../components/TrustScore';
import HowCoachacademWorks from '../components/HowCoachacademWorks';

function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <SEO
        title="Find Online Tutors in the UAE | IGCSE, IB, A-Level & More | CoachAcadem"
        description="Find qualified online tutors across the UAE for IGCSE, IB, A-Level, American Curriculum, CBSE
and more. Compare tutor profiles, book lessons, and learn with confidence through CoachAcadem."
        name="Coach Academ"
        type="website"
        keywords="Online Tutors UAE, Private Tutors UAE, Find Tutors UAE, IGCSE Tutors UAE, IB Tutors UAE,
A-Level Tutors UAE."
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
      <TrustScore />
      {/* Search bar here for subjects and Cirricula */}
      <HowItWorks />
      <TutorLanguages />
      <HowCoachacademWorks />

      {/* <Features /> */}
      {/* <LoveLessonsBanner /> */}
      
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