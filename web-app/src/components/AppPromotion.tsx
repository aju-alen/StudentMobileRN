import { Check, ArrowRight } from 'lucide-react';
import AppleLogo from "../assets/apple-black-logo-svgrepo-com.svg"

const AppPromotion = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-indigo-900 to-blue-800 text-white overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-white rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-white rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3"></div>
      </div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* App mockup */}
          <div className="lg:w-1/2 order-2 lg:order-1">
            
              <div className="relative h-[600px]">
            {/* Main device mockup */}
            <div className="absolute  flex items-center justify-center">
             <img src="https://coachacademic.s3.ap-southeast-1.amazonaws.com/dummy-image/iphone-community-portrait.png" alt="App Screenshot" className="w-full h-full object-contain" />
            </div>
              
              {/* Decorative elements */}
              <div className="absolute top-1/4 -left-8 w-16 h-16 bg-indigo-300 rounded-full blur-xl opacity-70"></div>
              <div className="absolute bottom-1/4 -right-8 w-20 h-20 bg-blue-300 rounded-full blur-xl opacity-70"></div>
            </div>
          </div>
          
          {/* Content */}
          <div className="lg:w-1/2 order-1 lg:order-2 text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Take Your Learning Journey <br />Anywhere with Our Mobile App
            </h2>
            <p className="text-lg text-indigo-100 mb-8 max-w-xl mx-auto lg:mx-0">
              Download the Coach Academ app and transform how you learn. Access courses, join live sessions, and connect with your learning community from your mobile device.
            </p>
            
            <div className="mb-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto lg:mx-0">
                {[
                  "Mobile-optimized learning experience",
                  "Live sessions with feedback and support",
                  "Community engagement and discussion",
                ].map((item, index) => (
                  <div key={index} className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-indigo-400 rounded-full mr-3 mt-0.5">
                      <Check size={14} />
                    </span>
                    <span className="text-indigo-50">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              <a href="https://apps.apple.com/in/app/coach-academ/id6745173635" className="flex items-center justify-center bg-black text-white rounded-xl px-6 py-3 hover:bg-gray-900 transition-colors">
                <img src={AppleLogo} alt="Apple Logo" className="w-8 h-8 mr-3" />
                <div className="text-left">
                  <div className="text-xs">Download on the</div>
                  <div className="text-xl font-semibold -mt-1">App Store</div>
                </div>
              </a>
              {/* Google Play ad */}
              {/* <a href="#" className="flex items-center justify-center bg-black text-white rounded-xl px-6 py-3 hover:bg-gray-900 transition-colors">
                <svg className="w-8 h-8 mr-3" viewBox="0 0 24 24" fill="none">
                  <path d="M3.60156 3.60156V20.3984H20.3984V3.60156H3.60156ZM15.9984 11.9984L12.9984 9.59844V14.3984L15.9984 11.9984Z" fill="white"/>
                </svg>
                <div className="text-left">
                  <div className="text-xs">GET IT ON</div>
                  <div className="text-xl font-semibold -mt-1">Google Play</div>
                </div>
              </a> */}
            </div>
            
            {/* <a href="#" className="inline-flex items-center text-indigo-200 hover:text-white mt-6 group">
              <span>Learn more about app features</span>
              <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-1" />
            </a> */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppPromotion;