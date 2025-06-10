import { useEffect, useState } from 'react';
import { Clock, Users, Star, ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import axios from 'axios';

interface User {
  name: string;
  profileImage: string;
}

interface Subject {
  id: string;
  subjectName: string;
  subjectNameSubHeading: string;
  subjectDuration: number;
  subjectSearchHeading: string;
  subjectDescription: string;
  subjectPoints: string[];
  subjectImage: string;
  subjectPrice: number;
  subjectBoard: string;
  subjectLanguage: string;
  subjectTags: string[];
  subjectGrade: number;
  subjectVerification: boolean;
  teacherVerification: string[];
  createdAt: string;
  userId: string;
  user: User;
}

const Courses = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await axios.get(`https://studentmobilern-31oo.onrender.com/api/subjects/advance-search`, {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_API_AUTH_TOKEN}`
          }
        });
        setSubjects(response.data.subjects);
      } catch (error) {
        console.error('Error fetching subjects:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  if (loading) {
    return (
      <section id="courses" className="py-12 sm:py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center">Loading courses...</div>
        </div>
      </section>
    );
  }

  return (
    <section id="courses" className="py-12 sm:py-16 md:py-20 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12">
          <div className="max-w-2xl mb-6 md:mb-0">
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-indigo-600" />
              <span className="text-sm md:text-base text-indigo-600 font-medium">Featured Courses</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">
              Popular Courses to
              <span className="bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent block sm:inline"> 
                Get You Started
              </span>
            </h2>
            <p className="text-base md:text-xl text-gray-600">
              Explore our highest-rated courses taught by industry experts and transform your career.
            </p>
          </div>
          {/* <a 
            href="#" 
            className="inline-flex items-center text-indigo-600 font-medium hover:text-indigo-800 group bg-white px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-sm hover:shadow-md transition-all text-sm md:text-base"
          >
            <span>Browse all courses</span>
            <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-1" />
          </a> */}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {subjects.map((subject) => (
            <div 
              key={subject.id} 
              className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col group"
            >
              <div className="relative">
                <img 
                  src={subject.subjectImage} 
                  alt={subject.subjectName} 
                  className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 sm:top-4 left-3 sm:left-4 flex flex-wrap gap-2">
                  <div className="bg-white/90 backdrop-blur-sm py-1 px-2 sm:px-3 rounded-full text-xs sm:text-sm font-medium text-indigo-600">
                    {subject.subjectBoard}
                  </div>
                  <div className="bg-white/90 backdrop-blur-sm py-1 px-2 sm:px-3 rounded-full text-xs sm:text-sm font-medium text-indigo-600">
                    Grade {subject.subjectGrade}
                  </div>
                </div>
              </div>
              
              <div className="p-4 sm:p-6 flex-grow flex flex-col">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <span className="text-xs sm:text-sm font-medium text-indigo-600 bg-indigo-50 px-2 sm:px-3 py-1 rounded-full">
                    {subject.subjectLanguage}
                  </span>
                  {subject.subjectVerification && (
                    <div className="flex items-center">
                      <Star size={14} className="text-yellow-400 fill-current" />
                      <span className="ml-1 text-xs sm:text-sm font-medium">Verified</span>
                    </div>
                  )}
                </div>
                
                <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 group-hover:text-indigo-600 transition-colors">
                  {subject.subjectName}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">{subject.subjectNameSubHeading}</p>
                
                <div className="flex items-center gap-4 mb-3 sm:mb-4 text-gray-600">
                  <div className="flex items-center">
                    <Clock size={14} className="mr-1" />
                    <span className="text-xs sm:text-sm">{subject.subjectDuration} months</span>
                  </div>
                </div>

                <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
                  {subject.subjectPoints.map((point, i) => (
                    <div key={i} className="flex items-center text-xs sm:text-sm text-gray-600">
                      <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-indigo-600 mr-2"></div>
                      {point}
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center justify-between mt-auto pt-3 sm:pt-4 border-t border-gray-100">
                  <div className="flex items-center">
                    <img 
                      src={subject.user.profileImage}
                      alt={subject.user.name}
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover mr-2"
                    />
                    <span className="text-xs sm:text-sm text-gray-600">
                      By <span className="font-medium text-gray-900">{subject.user.name}</span>
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-3 sm:p-4 bg-gray-50">
                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm sm:text-base font-medium py-2 rounded-lg sm:rounded-xl transition-colors flex items-center justify-center gap-2" onClick={() => window.open('https://apps.apple.com/in/app/coach-academ/id6745173635', '_blank')}>
                  View more on Coach Academ
                  <ArrowRight size={14} className="sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Courses;