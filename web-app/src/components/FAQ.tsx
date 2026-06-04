import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    question: "How do I find a tutor on CoachAcadem?",
    answer: "You can search for tutors by name, subject, curriculum, and academic level. You can also filter your search results by location, availability, and price."
  },
  {
    question: "Are tutors verified?",
    answer: "Yes, all tutors are verified by our team and only those who are certified and verified by KHDA are allowed to teach on our platform. You do not have to worry."
  },
  {
    question: "Can I read tutor reviews before booking?",
    answer: "Yes, you can read tutor reviews before booking. You can also read reviews from other parents who have booked the tutor."
  },
  {
    question: "Do tutors support different curricula?",
    answer: "Yes, tutors support different curricula. You can search for tutors by curriculum and academic level."
  },
  {
    question: "Can lessons be booked instantly?",
    answer: "Yes, lessons can be booked instantly. You can book a lesson by clicking the book button and selecting the date and time."
  },
  {
    question: "How do I communicate with tutors?",
    answer: "You can communicate with tutors by clicking the chat button and sending a message. You can also call the tutor by clicking the call button and entering the phone number."
  },
  {
    question:"Can students in Dubai, Abu Dhabi, Sharjah, Ajman, Fujairah, Ras Al Khaimah and Umm Al Quwain use CoachAcadem?",
    answer:"Yes, students in Dubai, Abu Dhabi, Sharjah, Ajman, Fujairah, Ras Al Khaimah and Umm Al Quwain can use CoachAcadem. We are currently available in the UAE and we are working to expand to other countries soon."
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);
  
  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };
  
  return (
    <section id="faq" className="home-section home-section-spacing max-md:!py-12 bg-white">
      <div className="home-section-inner">
        <h2 className="home-section-title max-md:text-3xl max-md:!mb-6 max-md:leading-tight max-md:px-1">
          Q&A for the curious
        </h2>

        <div className="max-md:-mx-1">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`border-b border-gray-200 ${index === 0 ? 'border-t' : ''}`}
            >
              <button
                type="button"
                className="w-full max-md:py-4 md:py-6 text-left flex justify-between max-md:items-start md:items-center gap-3 focus:outline-none"
                onClick={() => toggleFAQ(index)}
                aria-expanded={openIndex === index}
              >
                <span className="text-[1.5rem] max-md:text-lg font-medium text-gray-900 max-md:leading-snug min-w-0 flex-1">
                  {faq.question}
                </span>
                {openIndex === index ? (
                  <ChevronUp className="flex-shrink-0 max-md:ml-0 md:ml-4 max-md:mt-0.5 text-indigo-600 max-md:!h-4 max-md:!w-4" size={20} />
                ) : (
                  <ChevronDown className="flex-shrink-0 max-md:ml-0 md:ml-4 max-md:mt-0.5 text-gray-400 max-md:!h-4 max-md:!w-4" size={20} />
                )}
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96 max-md:pb-4 pb-6' : 'max-h-0'
                }`}
              >
                <p className="text-gray-600 leading-relaxed text-[1.3rem] max-md:text-base max-md:leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Still have questions?
          </p>
          <a 
            href="mailto:support@coachacadem.ae" 
            className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full font-medium transition-colors"
          >
            Contact Support
          </a>
        </div> */}
      </div>
    </section>
  );
};

export default FAQ;