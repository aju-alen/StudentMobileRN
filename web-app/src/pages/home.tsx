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
        title="Online Tutoring Platform"
        description="CoachAcadem is a leading online tutoring platform that provides personalized and effective learning solutions for students of all ages and levels. Find qualified tutors, schedule sessions, and achieve your academic goals."
        name="CoachAcadem"
        type="website"
        keywords="online tutoring, UAE tutors, private tutors, academic coaching, math tutors, science tutors, English tutors, homework help, exam preparation"
        author="CoachAcadem"
        tags={["online tutoring", "education", "UAE", "private tutors", "academic support"]}
        schema={{
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "CoachAcadem",
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