import React from 'react';
import { ArrowRight } from 'lucide-react';

const CallToAction = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-indigo-600 to-blue-700 text-white">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            Start Your Learning Journey Today
          </h2>
          <p className="text-xl text-indigo-100 mb-8 md:px-10">
            Join with other learners who have transformed their skills and careers with Coach Academ innovative learning platform.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-10">
            <button className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-4 rounded-full font-medium transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center">
              Download the App
              <ArrowRight size={18} className="ml-2" />
            </button>
            <button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-indigo-600 px-8 py-4 rounded-full font-medium transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              Browse Courses
            </button>
          </div>
          
          {/* <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden">
                  <img 
                    src={`https://images.pexels.com/photos/22078${i}/pexels-photo-22078${i}.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&dpr=1`}
                    alt={`User ${i}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            <div className="text-center sm:text-left">
              <div className="text-lg font-medium">Join 25,000+ learners</div>
              <div className="text-indigo-200 text-sm">Average 4.8/5 star rating</div>
            </div>
          </div> */}
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-white opacity-5 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3"></div>
    </section>
  );
};

export default CallToAction;