import  { useEffect, useRef } from 'react';
import { Play, LampDesk, BookOpen, GraduationCap, Presentation, Video } from 'lucide-react';

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
      className="pt-32 pb-20 md:pt-40 md:pb-32 px-4 relative overflow-hidden bg-gradient-to-b from-indigo-50 to-white"
    >
      <div className="container mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2  gap-12 items-center">
          {/* Left Column - Content */}
          <div className="text-left">
            <h1 className="text-4xl md:text-5xl lg:text-5xl font-bold mb-6 lg:leading-tight  ">
             UAE's #1 Academic Coaching Platform
              {/* <div className="bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent"> 
                 Coach Academ
              </div> */}
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Interactive courses, live Zoom sessions, and a community of learners - all in one powerful app designed to transform your educational journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full font-medium transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1" onClick={() => window.open('https://apps.apple.com/in/app/coach-academ/id6745173635', '_blank')}>
                Download App
              </button>
              {/* <button className="flex items-center justify-center bg-white hover:bg-gray-50 border border-gray-200 hover:border-indigo-300 text-gray-700 px-8 py-3 rounded-full font-medium transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                <Play size={18} className="text-indigo-600 mr-2" />
                Watch Demo
              </button> */}
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
          <div className="relative h-[600px]">
            {/* Main device mockup */}
            <div className="absolute  flex items-center justify-center">
             <img src="https://coachacademic.s3.ap-southeast-1.amazonaws.com/dummy-image/hero-screenshot-left.png" alt="App Screenshot" className="w-full h-full object-contain" />
            </div>

            {/* Floating elements */}
            <FloatingElement className="top-20 -left-8">
              <div className="bg-white p-4 rounded-2xl shadow-lg">
                <BookOpen size={32} className="text-indigo-600" />
              </div>
            </FloatingElement>
            
            <FloatingElement className="top-40 -right-4">
              <div className="bg-white p-4 rounded-2xl shadow-lg">
                <LampDesk size={32} className="text-yellow-500" />
              </div>
            </FloatingElement>
            
            <FloatingElement className="bottom-32 -left-12">
              <div className="bg-white p-4 rounded-2xl shadow-lg">
                <GraduationCap size={32} className="text-green-500" />
              </div>
            </FloatingElement>
            
            <FloatingElement className="top-1/4 right-1/4">
              <div className="bg-white p-4 rounded-2xl shadow-lg">
                <Presentation size={32} className="text-blue-500" />
              </div>
            </FloatingElement>
            
            <FloatingElement className="bottom-1/4 -right-8">
              <div className="bg-white p-4 rounded-2xl shadow-lg">
                <Video size={32} className="text-purple-500" />
              </div>
            </FloatingElement>

            {/* Background decorative elements */}
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-indigo-100 rounded-full blur-3xl opacity-30"></div>
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-30"></div>
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