import { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';



type NavItem =
  | { label: string; type: 'link'; items: { label: string; }[] }
  | { label: string; type: 'dropdown'; items: { label: string; }[] };

const mainNav: NavItem[] = [
  {
    label: 'Find Tutors',
    type: 'dropdown',
    items: [
      { label: 'Math Tutors' },
      { label: 'Physics Tutors'  },
      { label: 'Chemistry Tutors'  },
      { label: 'Biology Tutors'  },
      { label: 'English Tutors'  },
      { label: 'Arabic Tutors'  },
      { label: 'Economics Tutors'  },
      { label: 'Accounting Tutors'  },
      { label: 'Computer Science Tutors'  },
    ],
  },
  {
    label: 'Cirricula',
    type: 'dropdown',
    items: [
      { label: 'IGCSE Tutors' },
      { label: 'GCSE Tutors' },
      { label: 'A-Level Tutors' },
      { label: 'IB Tutors' },
      { label: 'American Curriculum Tutors' },
      { label: 'CBSE Tutors' },
    ],
  },
  {
    label: 'How it works',
    type: 'link',
    items: [
      { label: 'How it works' },
    ],
  },
  {
    label: 'Resources',
    type: 'dropdown',
    items: [
      { label: 'Parent Guides' },
      { label: 'Study Tips' },
      { label: 'Exam Preparation' },
      { label: 'Blog' },
    ],
  },
  {
    label: 'Become a Tutor',
    type: 'link',
    items: [
      { label: 'Become a Tutor' },
    ],
  },
];

const linkClass =
  'text-black-700 hover:text-indigo-600 font-medium transition-colors';
const dropdownItemClass =
  'block px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-[#205072] font-medium transition-colors';
const mobileDropdownItemClass =
  'text-gray-600 hover:text-indigo-600 font-medium transition-colors';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpenDropdowns, setMobileOpenDropdowns] = useState<
    Record<string, boolean>
  >({});
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMobileDropdown = (label: string) => {
    setMobileOpenDropdowns((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const closeMobileMenu = () => {
    setIsOpen(false);
    setMobileOpenDropdowns({});
  };

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-3' : 'bg-white py-5'
      }`}
    >
      <div className="home-section">
        <div className="home-section-inner pl-0 pr-4 md:px-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center min-w-0 gap-6 md:gap-10 lg:gap-14">
            <img
              src="https://coachacademic.s3.ap-southeast-1.amazonaws.com/dummy-image/logo.png"
              alt="Logo"
              className="h-20 w-20 shrink-0"
            />
            <nav
              ref={navRef}
              className="hidden md:flex items-center space-x-8 md:mt-4 md:ml-10 lg:ml-16"
            >
              {mainNav.map((item) =>
                item.type === 'dropdown' ? (
                  <div key={item.label} className="relative">
                    <button
                      type="button"
                      className={`flex items-center gap-1 ${linkClass}`}
                      onClick={() =>
                        setOpenDropdown((prev) =>
                          prev === item.label ? null : item.label
                        )
                      }
                      aria-expanded={openDropdown === item.label}
                      aria-haspopup="true"
                    >
                      {item.label}
                      <ChevronDown
                        size={18}
                        className={`transition-transform duration-200 ${
                          openDropdown === item.label ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {openDropdown === item.label && (
                      <div className="absolute left-0 top-full mt-2 min-w-[220px] rounded-lg border border-gray-100 bg-white py-2 shadow-lg">
                        {item.items.map((sub) => (
                          <a
                            key={sub.label}
                            className={dropdownItemClass}
                            onClick={() => setOpenDropdown(null)}
                          >
                            {sub.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <a key={item.label} className={linkClass}>
                    {item.label}  
                  </a>
                )
              )}
            </nav>
          </div>

          <div className="hidden md:block shrink-0">
            <button
              className="bg-[#205072] hover:bg-[#24bcc7] text-white text-lg px-5 py-2 rounded-full font-medium transition-colors"
              onClick={() =>
                window.open(
                  'https://apps.apple.com/us/app/coach-academ/id6745173635',
                  '_blank'
                )
              }
            >
              Get the App
            </button>
          </div>

          <button
            className="md:hidden text-gray-700"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-gray-100">
            <nav className="flex flex-col space-y-4">
              {mainNav.map((item) =>
                item.type === 'dropdown' ? (
                  <div key={item.label}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between text-gray-700 hover:text-indigo-600 font-medium transition-colors"
                      onClick={() => toggleMobileDropdown(item.label)}
                    >
                      {item.label}
                      <ChevronDown
                        size={18}
                        className={`transition-transform duration-200 ${
                          mobileOpenDropdowns[item.label] ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {mobileOpenDropdowns[item.label] && (
                      <div className="mt-2 ml-3 flex flex-col space-y-2 border-l-2 border-gray-100 pl-3">
                        {item.items.map((sub) => (
                          <a
                            key={sub.label}
                            className={mobileDropdownItemClass}
                            onClick={closeMobileMenu}
                          >
                            {sub.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <a
                    key={item.label}
                    className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
                    onClick={closeMobileMenu}
                  >
                    {item.label}
                  </a>
                )
              )}
              <button
                className="bg-[#205072] hover:bg-[#24bcc7] text-white w-full py-2 rounded-full font-medium transition-colors mt-2"
                onClick={() =>
                  window.open(
                    'https://apps.apple.com/us/app/coach-academ/id6745173635',
                    '_blank'
                  )
                }
              >
                Get the App
              </button>
            </nav>
          </div>
        )}
        </div>
      </div>
    </header>
  );
};

export default Header;
