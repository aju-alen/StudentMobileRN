import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Testimonials from '../components/Testimonials';
import AppPromotion from '../components/AppPromotion';
import Courses from '../components/Courses';
import FAQ from '../components/FAQ';
import CallToAction from '../components/CallToAction';
import Footer from '../components/Footer';

function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <Features />
      <AppPromotion />
      <Courses />
      {/* <Testimonials /> */}
      <FAQ />
      <CallToAction />
      <Footer />
    </div>
  );
}

export default Home;