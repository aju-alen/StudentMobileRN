const tutors = [
  {
    name: 'Milena',
    rating: 4.9,
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
    languages: [
      { label: 'French (Native)', icon: '🇫🇷' },
      { label: 'English (Advanced)', icon: '🇬🇧' },
    ],
  },
  {
    name: 'Ravi',
    rating: 4.8,
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    languages: [
      { label: 'French (Native)', icon: '🇫🇷' },
      { label: 'English (Advanced)', icon: '🇬🇧' },
    ],
  },
  {
    name: 'Sophie',
    rating: 4.7,
    image: 'https://randomuser.me/api/portraits/women/68.jpg',
    languages: [
      { label: 'French (Native)', icon: '🇫🇷' },
      { label: 'English (Advanced)', icon: '🇬🇧' },
    ],
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20 bg-white md:px-32">
      <div className="container mx-auto px-4 md:px-0">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-14">
        How Coach Academ works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="border rounded-2xl p-8 bg-white shadow-sm flex flex-col items-start">
            <div className="mb-4">
              <span className="inline-block bg-teal-200 text-teal-900 font-bold rounded-lg px-4 py-1 text-lg">1</span>
            </div>
            <h3 className="text-2xl font-bold mb-2">Find your tutor</h3>
            <p className="text-gray-600 mb-6">Our app connects you to tutors who will motivate, challenge, and inspire you.</p>
            {/* <div className="w-full">
              {tutors.map((tutor, idx) => (
                <div key={tutor.name} className={`flex items-center bg-gray-50 rounded-xl p-3 mb-2 border ${idx === 0 ? 'border-gray-200' : 'border-transparent'}`}>
                  <img src={tutor.image} alt={tutor.name} className="w-14 h-14 rounded-full object-cover mr-4" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-lg">{tutor.name}</span>
                      <span className="flex items-center text-sm font-medium text-gray-700">
                        <span className="mr-1">★</span>{tutor.rating}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">French tutor</div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {tutor.languages.map((lang, i) => (
                        <span key={i} className="flex items-center text-xs text-gray-600 bg-gray-100 rounded px-2 py-0.5">
                          <span className="mr-1">{lang.icon}</span>{lang.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div> */}
          </div>
          {/* Step 2 */}
          <div className="border rounded-2xl p-8 bg-white shadow-sm flex flex-col items-start">
            <div className="mb-4">
              <span className="inline-block bg-yellow-200 text-yellow-900 font-bold rounded-lg px-4 py-1 text-lg">2</span>
            </div>
            <h3 className="text-2xl font-bold mb-2">Schedule lessons</h3>
            <p className="text-gray-600 mb-6">Start learning with tutors who will guide you through your first lesson and help you plan your next steps.</p>
            {/* <div className="w-full flex items-center justify-center mt-auto">
              <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Tutor" className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg -mr-6 z-10" />
              <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Student" className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg z-0" />
            </div> */}
          </div>
          {/* Step 3 */}
          <div className="border rounded-2xl p-8 bg-white shadow-sm flex flex-col items-start">
            <div className="mb-4">
              <span className="inline-block bg-blue-200 text-blue-900 font-bold rounded-lg px-4 py-1 text-lg">3</span>
            </div>
            <h3 className="text-2xl font-bold mb-2">Track your progress</h3>
            <p className="text-gray-600 mb-6">Learning happens at your own pace. Set goals and track progress to see how far or close you are to reaching them.</p>
            {/* <div className="flex items-center space-x-2 mt-auto">
              <img src="https://randomuser.me/api/portraits/men/97.jpg" alt="Lesson" className="w-16 h-16 rounded-lg object-cover border-2 border-white shadow" />
              <img src="https://randomuser.me/api/portraits/men/97.jpg" alt="Lesson" className="w-16 h-16 rounded-lg object-cover border-2 border-white shadow -ml-6" />
              <img src="https://randomuser.me/api/portraits/men/97.jpg" alt="Lesson" className="w-16 h-16 rounded-lg object-cover border-2 border-white shadow -ml-6" />
            </div> */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks; 