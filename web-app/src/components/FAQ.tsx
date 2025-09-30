import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    question: "How do the live Zoom sessions work?",
    answer: "After you purchase a course, you will receive a link to the live session. You can join the session by clicking the link and entering the password. It's that simple!"
  },
  {
    question: "Can I download courses for offline viewing?",
    answer: "No, we do not offer offline viewing as this is a live only session but we do intend to bring live recordings to be available very soon."
  },
  {
    question: "How do I get help if I'm stuck on a topic?",
    answer: "We have a chat service which can be availed after you purchase a course. You can then ask your questions to the instructor and get help or get help during the live session."
  },
  {
    question: "How can I contact Coach Academ for any queries and feedback?",
    answer: "You can contact us at support@coachacadem.ae and we also plan to bring in other support services soon."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit and debit cards. We also accept payment via link as well."
  },
  {
    question: "Are the instructors certified and verified?",
    answer: "Yes, all our instructors are certified and verified by our team and only those who are certified and verified by KHDA are allowed to teach on our platform. You do not have to worry."
  },
  {
    question:"How can I block or report any content on the platform?",
    answer:"You can block or report any content on Coach Academ by clicking the three dots on the course page and selecting the option to block or report. We will review the content and take appropriate action."
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);
  
  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };
  
  return (
    <section id="faq" className="py-20 bg-gwhite">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Frequently Asked 
            <span className="bg-gradient-to-r pl-2 from-indigo-600 to-blue-500 bg-clip-text text-transparent"> 
              Questions
            </span>
          </h2>
          <p className="text-xl text-gray-600">
            Find answers to common questions about Coach Academ and our learning platform.
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`border-b border-gray-200 ${index === 0 ? 'border-t' : ''}`}
            >
              <button
                className="w-full py-6 text-left flex justify-between items-center focus:outline-none"
                onClick={() => toggleFAQ(index)}
              >
                <span className="text-lg font-medium text-gray-900">{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="flex-shrink-0 ml-4 text-indigo-600" size={20} />
                ) : (
                  <ChevronDown className="flex-shrink-0 ml-4 text-gray-400" size={20} />
                )}
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96 pb-6' : 'max-h-0'
                }`}
              >
                <p className="text-gray-600 leading-relaxed">
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