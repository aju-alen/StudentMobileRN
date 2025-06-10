import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, Quote } from 'lucide-react';

const testimonials = [
  {
    content: "Coach Academ transformed my learning experience completely. The live Zoom sessions and interactive content made complex topics approachable and engaging.",
    author: "Emma Thompson",
    role: "UX Designer",
    company: "Creative Solutions",
    avatar: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
  },
  {
    content: "As someone with a busy schedule, the flexibility of Coach Academ's platform has been a game-changer. I can learn at my own pace while still benefiting from expert instruction.",
    author: "David Chen",
    role: "Software Engineer",
    company: "TechCorp",
    avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
  },
  {
    content: "The community aspect of Coach Academ sets it apart. Connecting with other learners and getting direct feedback from instructors has accelerated my growth tremendously.",
    author: "Sophia Rodriguez",
    role: "Marketing Specialist",
    company: "GrowthLabs",
    avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
  },
  {
    content: "I've tried several learning platforms, but Coach Academ's mobile app is by far the most intuitive and feature-rich. Learning on the go has never been easier.",
    author: "James Wilson",
    role: "Data Analyst",
    company: "InsightMetrics",
    avatar: "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
  }
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);
  
  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };
  
  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };
  
  useEffect(() => {
    if (!isPaused) {
      intervalRef.current = setInterval(nextTestimonial, 5000);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused]);
  
  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);
  
  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What Our 
            <span className="bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent"> 
              Students
            </span> Say
          </h2>
          <p className="text-xl text-gray-600">
            Join thousands of satisfied learners who have transformed their skills with Coach Academ.
          </p>
        </div>
        
        <div 
          className="relative max-w-4xl mx-auto"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="relative overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={index} className="w-full flex-shrink-0 px-4">
                  <div className="bg-gray-50 rounded-2xl p-8 md:p-10 shadow-sm">
                    <Quote className="text-indigo-200 h-12 w-12 mb-6" />
                    
                    <blockquote className="text-xl md:text-2xl text-gray-700 font-medium leading-relaxed mb-8">
                      "{testimonial.content}"
                    </blockquote>
                    
                    <div className="flex items-center">
                      <img 
                        src={testimonial.avatar} 
                        alt={testimonial.author} 
                        className="w-14 h-14 rounded-full object-cover mr-4"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">{testimonial.author}</div>
                        <div className="text-gray-500">
                          {testimonial.role}, {testimonial.company}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-center mt-8">
            <button 
              className="bg-white text-indigo-600 border border-indigo-200 rounded-full p-3 shadow-sm hover:shadow-md transition-all mr-4"
              onClick={prevTestimonial}
              aria-label="Previous testimonial"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex space-x-2 items-center">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentIndex ? 'bg-indigo-600 scale-125' : 'bg-gray-300'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
            <button 
              className="bg-white text-indigo-600 border border-indigo-200 rounded-full p-3 shadow-sm hover:shadow-md transition-all ml-4"
              onClick={nextTestimonial}
              aria-label="Next testimonial"
            >
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;