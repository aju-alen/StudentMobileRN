import  { useEffect, useRef } from 'react';
import { Play, LampDesk, BookOpen, GraduationCap, Presentation, Video } from 'lucide-react';
import AppDownloadQR from '../assets/app-download.svg';

const FloatingElement = ({ children, className }: { children: React.ReactNode, className: string }) => {
  const elementRef = useRef(null);
  
  useEffect(() => {
    const element = elementRef.current;
    let position = Math.random() * 100;
    let speed = 0.3 + Math.random() * 0.5;
    let direction = Math.random() > 0.5 ? 1 : -1;
    
    const animate = () => {
      position += speed * direction;
      if (position > 100) {
        direction = -1;
        position = 100;
      } else if (position < 0) {
        direction = 1;
        position = 0;
      }
      
      // if (element) {
      //   element.style.transform = `translateY(${Math.sin(position * 0.05) * 15}px)`;
      // }
      requestAnimationFrame(animate);
    };
    
    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);
  
  return (
    <div 
      ref={elementRef} 
      className={`absolute transition-transform duration-1000 ${className}`}
    >
      {children}
    </div>
  );
};

const Hero = () => {
  return (
    <section 
      id="home" 
      className="home-section !py-0 pt-28 pb-10 sm:pt-32 sm:pb-16 md:pt-28 md:pb-20 relative overflow-hidden bg-gradient-to-b from-indigo-50 to-white h-full"
    >
      <div className="home-section-inner relative z-10 h-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-0 lg:min-h-[720px] xl:min-h-[760px]">
          {/* Left Column - Content */}
          <div className="order-2 lg:order-1 text-left flex flex-col justify-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-[600] mb-3 lg:mb-2 lg:leading-tight mt-0 lg:mt-36 font-sans">
            Find expert online tutors across the UAE
              {/* <div className="bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent"> 
                 Coach Academ
              </div> */}
            </h1>
            <p className="text-lg sm:text-[1.3rem] text-gray-600 mb-6 sm:mb-8 lg:leading-8">
            Connect with qualified tutors for IGCSE, IB, A-Level, American, CBSE, and more. Compare tutor
            profiles, book lessons, and learn online.
            </p>
            <div className="mb-6 sm:mb-8">
              <div className="flex w-full flex-row items-center justify-between gap-4 rounded-2xl bg-[#205072] px-4 py-4 shadow-xl sm:px-6 sm:py-5 lg:inline-flex lg:w-auto lg:justify-start lg:gap-6">
                <div className="flex flex-col justify-center gap-1 min-w-0 flex-1 sm:pr-2">
                  <span className="text-base sm:text-lg lg:text-xl font-semibold text-white">
                    Get the app
                  </span>
                  <span className="text-xs sm:text-sm text-white/85 leading-snug">
                    Scan to download on iOS or Android
                  </span>
                </div>
                <div className="rounded-xl border border-white/30 bg-white p-2 sm:p-3 shadow-md shrink-0">
                  <img
                    src={AppDownloadQR}
                    alt="Scan to download app"
                    className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center">
              {/* <div className="flex space-x-1">
                {Array(5).fill(0).map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="ml-2 text-gray-600">
                <span className="font-semibold">4.9/5</span> from over 1,200+ reviews
              </span> */}
            </div>
          </div>

          {/* Right Column - App Screenshot */}
          <div className="order-1 lg:order-2 relative h-[260px] sm:h-[320px] md:h-[380px] lg:h-full lg:min-h-[720px] -mx-2 sm:mx-0">
            {/* Main device mockup */}
            <div className="absolute inset-0 flex items-center justify-center px-2 sm:px-0">
             <img src="https://coachacademic.s3.ap-southeast-1.amazonaws.com/dummy-image/hero-screenshot-left.png" alt="App Screenshot" className="w-full h-full max-h-full object-contain object-center" />
            </div>

            {/* Floating elements — desktop only */}
            <FloatingElement className="hidden lg:block top-20 -left-8">
              <div className="bg-white p-4 rounded-2xl shadow-lg">
                <BookOpen size={32} className="text-indigo-600" />
              </div>
            </FloatingElement>
            
            <FloatingElement className="hidden lg:block top-40 -right-4">
              <div className="bg-white p-4 rounded-2xl shadow-lg">
                <LampDesk size={32} className="text-yellow-500" />
              </div>
            </FloatingElement>
            
            <FloatingElement className="hidden lg:block bottom-32 -left-12">
              <div className="bg-white p-4 rounded-2xl shadow-lg">
                <GraduationCap size={32} className="text-green-500" />
              </div>
            </FloatingElement>
            
            <FloatingElement className="hidden lg:block top-1/4 right-1/4">
              <div className="bg-white p-4 rounded-2xl shadow-lg">
                <Presentation size={32} className="text-blue-500" />
              </div>
            </FloatingElement>
            
            <FloatingElement className="hidden lg:block bottom-1/4 -right-8">
              <div className="bg-white p-4 rounded-2xl shadow-lg">
                <Video size={32} className="text-purple-500" />
              </div>
            </FloatingElement>



            {/* Background decorative elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 sm:w-64 sm:h-64 bg-indigo-100 rounded-full blur-3xl opacity-20 lg:opacity-30"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 sm:w-64 sm:h-64 bg-blue-100 rounded-full blur-3xl opacity-20 lg:opacity-30"></div>
          </div>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-b from-indigo-50/60 to-white/10 -z-10"></div>
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-b from-blue-100/30 to-transparent rounded-full blur-3xl -z-10 transform translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-gradient-to-t from-indigo-100/30 to-transparent rounded-full blur-3xl -z-10 transform -translate-x-1/3 translate-y-1/3"></div>
    </section>
  );
};
export default Hero;