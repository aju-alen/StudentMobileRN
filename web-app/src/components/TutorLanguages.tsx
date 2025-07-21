import React from 'react';

const stats = [
  { label: 'Qualified tutors Store', value: '1000+', stars: 5 },
  { label: 'Tutor reviews', value: '4/5-star' },
  { label: 'Subjects', value: '50+' },
  { label: 'On the App', value: '4' }
];

const languages = [
  { name: 'English Tutors', description: 'Improve your English with certified English tutors and teachers. Schedule your online lesson and start learning today.', icon: (
    <svg width="40" height="40" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#F3F4F6"/><path d="M12 4v16M4 12h16" stroke="#111827" strokeWidth="2" strokeLinecap="round"/></svg>
  ) },

  { name: 'Math Tutors',  description: 'From tough equations to complex concepts, understand and solve problems. Schedule online sessions with CBSE, GCSE, A-levels, and IB math tutors.', icon: (
    <svg width="40" height="40" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#F3F4F6"/><path d="M6 18L18 6M6 6l12 12" stroke="#111827" strokeWidth="2" strokeLinecap="round"/></svg>
  ) },

  { name: 'Arabic Tutors',  description: 'Communicate and speak like a native Arab, with polished grammar and clear pronunciation. Schedule your online lesson with an Arabic tutor today.', icon: (
    <svg width="40" height="40" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#F3F4F6"/><circle cx="12" cy="12" r="6" stroke="#111827" strokeWidth="2"/></svg>
  ) },

  { name: 'Biology Tutors',  description: 'Understand biology topics and concepts about life, from molecular biology to microbiology, and ecosystems across IGCSE, GCSE, IB, and A-level curricula. Schedule online classes with Biology tutors.', icon: (
    <svg width="40" height="40" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#F3F4F6"/><rect x="6" y="6" width="12" height="12" stroke="#111827" strokeWidth="2"/></svg>
  ) },

  { name: 'Physics Tutors',  description: 'Learn the core concepts of physics, from motion and energy to electricity and quantum mechanics. Get personalised, online guidance for GCSE, IGCSE, IB, A-Level, and EMSAT physics with expert online tutors who simplify ideas to help you excel.', icon: (
    <svg width="40" height="40" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#F3F4F6"/><path d="M12 6v12M6 12h12" stroke="#111827" strokeWidth="2"/></svg>
  ) },

  { name: 'Chemistry Tutors',  description: 'Learn chemistry, from atomic structure and bonding to reactions and biochemistry. Get clear, personalised learning and instructions from chemistry tutors who break down complex topics into simple, online lessons to help you excel in any curriculum.', icon: (
    <svg width="40" height="40" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#F3F4F6"/><path d="M8 8h8v8H8z" stroke="#111827" strokeWidth="2"/></svg>
  ) },

  { name: 'Science Tutors',  description: 'Explore key topics across biology, chemistry, and physics with guided, easy-to-follow lessons, personalised for you with expert science tutors who help and support you across major curricula.', icon: (
    <svg width="40" height="40" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#F3F4F6"/><path d="M12 4l4 16M12 4l-4 16" stroke="#111827" strokeWidth="2"/></svg>
  ) },

  { name: 'Computer Science Tutors',  description: 'Build skills in programming, algorithms, and data structures with personalised, step-by-step guidance from computer science tutors who simplify hard-to-understand concepts. Schedule your online classes.', icon: (
    <svg width="40" height="40" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#F3F4F6"/><circle cx="12" cy="12" r="4" stroke="#111827" strokeWidth="2"/></svg>
  ) },

  { name: 'Economics Tutors',  description: 'Understand key principles like supply and demand, market structures, and economic policies through clear, personalised online lessons. Expert economic tutors simplify complex theories to help you excel in your coursework.', icon: (
    <svg width="40" height="40" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#F3F4F6"/><rect x="8" y="8" width="8" height="8" stroke="#111827" strokeWidth="2"/></svg>
  ) },

  { name: 'Business Studies Tutors',  description: 'Develop a deep understanding of management, marketing, and organisational strategies through personalised online sessions from professional business studies tutors.', icon: (
    <svg width="40" height="40" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#F3F4F6"/><rect x="8" y="8" width="8" height="8" stroke="#111827" strokeWidth="2"/></svg>
  ) },

  { name: 'Social Studies Tutors',  description: 'Explore history, geography, civics, and culture through online lessons that connect concepts to real-world issues. Schedule your online classes with Social Studies tutors to learn.', icon: (
    <svg width="40" height="40" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#F3F4F6"/><rect x="8" y="8" width="8" height="8" stroke="#111827" strokeWidth="2"/></svg>
  ) },

  { name: 'SAT Tutors',  description: 'Boost your scores in math, reading, and writing with personalised strategies and practice with SAT tutors who support and help you approach tests with confidence. Schedule your online lessons.', icon: (
    <svg width="40" height="40" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#F3F4F6"/><rect x="8" y="8" width="8" height="8" stroke="#111827" strokeWidth="2"/></svg>
  ) },
  { name: 'French Tutors',  description: 'Build your skills in speaking, listening, reading, and writing through engaging, personalised lessons from expert French tutors who will help you with fluency, whether for school, exams, or everyday conversation.', icon: (
    <svg width="40" height="40" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#F3F4F6"/><rect x="8" y="8" width="8" height="8" stroke="#111827" strokeWidth="2"/></svg>
  ) },
  { name: 'Creative Writing Tutors',  description: 'Develop your storytelling, poetry, and writing skills through guidance that sparks creativity with creative writing tutors who help you find your unique voice and strengthen your writing for any project.', icon: (
    <svg width="40" height="40" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#F3F4F6"/><rect x="8" y="8" width="8" height="8" stroke="#111827" strokeWidth="2"/></svg>
  ) },
  { name: 'Language Tutors',  description: 'Enhance your speaking, listening, reading, and writing skills in the language of your choice with language tutors who support your progress at every level. Schedule your online language classes.', icon: (
    <svg width="40" height="40" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#F3F4F6"/><rect x="8" y="8" width="8" height="8" stroke="#111827" strokeWidth="2"/></svg>
  ) },
  { name: "Qur'an Tutors",  description: 'Learn accurate recitation, memorization, and understanding of the Qur’an with dedicated Qur’an tutors who support you at all levels with online lessons rooted in clarity, patience, and respect for tradition.', icon: (
    <svg width="40" height="40" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#F3F4F6"/><rect x="8" y="8" width="8" height="8" stroke="#111827" strokeWidth="2"/></svg>
  ) }
];

const TutorLanguages = () => {
  return (
    <section className="  py-12 px-4 md:px-32">
      {/* Stats Row */}
      <div className="flex flex-wrap justify-between items-center gap-6 mb-12">
        {stats.map((stat, i) => (
          <div key={i} className="flex flex-col items-center min-w-[120px]">
            <span className="text-2xl font-bold text-gray-900 flex items-center">
              {stat.value}
              {stat.stars && (
                <span className="ml-2 flex text-yellow-400">
                  {Array.from({ length: stat.stars }).map((_, idx) => (
                    <svg key={idx} width="18" height="18" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z"/></svg>
                  ))}
                </span>
              )}
            </span>
            <span className="text-gray-500 text-sm text-center mt-1">{stat.label}</span>
          </div>
        ))}
      </div>
      {/* Language Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 items-stretch">
        {languages.map((lang, i) => (
          <div
            key={i}
            className="[perspective:1000px] h-full"
          >
            <div className="relative w-full min-h-[10rem] h-full transition-transform duration-500 [transform-style:preserve-3d] group hover:[transform:rotateY(180deg)]">
              {/* Front Side */}
              <div className="absolute inset-0 flex items-center p-6 bg-white rounded-xl shadow border cursor-pointer [backface-visibility:hidden] h-full w-full">
                <div className="mr-4 flex-shrink-0">{lang.icon}</div>
                <div className="flex-1">
                  <div className="text-xl font-semibold text-gray-900 break-words">{lang.name}</div>
                </div>
                <div className="ml-auto">
                  <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
              {/* Back Side */}
              <div className="absolute inset-0 flex flex-col justify-center items-center p-6 bg-gray-50 rounded-xl shadow border text-center [transform:rotateY(180deg)] [backface-visibility:hidden] h-full w-full overflow-auto">
                <div className="text-lg font-semibold text-gray-900 mb-2 break-words">{lang.name}</div>
                <div className="text-gray-600 text-sm break-words text-left">{lang.description}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Show more link */}
      <div className="flex justify-start mt-8">
        <a href="#" className="flex items-center text-lg font-medium text-gray-900 hover:underline">
          <span className="text-2xl mr-2">+</span> Show more
        </a>
      </div>
    </section>
  );
};

export default TutorLanguages; 