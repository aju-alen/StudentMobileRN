import React, { useState, useEffect } from 'react';
import { Menu, X, GraduationCap } from 'lucide-react';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white shadow-md py-3' 
          : 'bg-white py-5'
      }`}
    >
      <div className="container mx-auto px-4 md:px-32">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <img src="https://coachacademic.s3.ap-southeast-1.amazonaws.com/dummy-image/logo.png" alt="Logo" className="h-20 w-20" />
             {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 md:ml-10">
            {['Find tutors', 'Become a tutor', 'Courses', 'FAQ'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`}
                className="text-black-700 hover:text-indigo-600 font-medium transition-colors"
              >
                {item}
              </a>
            ))}
          </nav>
          </div>
          
         
          
          <div className="hidden md:block">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-full font-medium transition-colors" onClick={() =>  window.open('https://apps.apple.com/us/app/coach-academ/id6745173635', '_blank')}>
              Get the App
            </button>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-700"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-gray-100">
            <nav className="flex flex-col space-y-4">
              {['Find tutors', 'Become a tutor', 'Courses', 'FAQ'].map((item) => (
                <a 
                  key={item} 
                  href={`#${item.toLowerCase()}`}
                  className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {item}
                </a>
              ))}
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white w-full py-2 rounded-full font-medium transition-colors mt-2" onClick={() =>  window.open('https://apps.apple.com/us/app/coach-academ/id6745173635', '_blank')}>
                Get the App
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;