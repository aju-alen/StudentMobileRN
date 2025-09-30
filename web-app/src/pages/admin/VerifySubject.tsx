import  { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, FileText, Clock,Globe, User, Star, Award } from 'lucide-react';
import { axiosWithAuth } from '../../common/customAxios';
import { ipUrl } from '../../common/ipUrl';
import { useNavigate, useParams } from 'react-router-dom';

const defaultSubject = {
    "id": "cmbiz0nlt002ko93ilmj22rqi",
    "subjectName": "Advanced Mathematics",
    "subjectNameSubHeading": "Calculus and Algebra",
    "subjectDuration": 4,
    "subjectSearchHeading": "math calculus algebra",
    "subjectDescription": "Comprehensive course covering advanced mathematical concepts including calculus, linear algebra, and statistical methods",
    "subjectPoints": [
      "Differential and Integral Calculus",
      "Linear Algebra fundamentals",
      "Statistical analysis methods",
      "Problem-solving techniques"
    ],
    "subjectImage": "https://coachacademic.s3.ap-southeast-1.amazonaws.com/users/cmbfe7kcx0000sbbx9u9hxc0p/subject/397ce30d-c155-4515-9250-f15b6919c4d3/photo.webp",
    "subjectPrice": 40000,
    "subjectBoard": "AP",
    "subjectLanguage": "English",
    "subjectTags": ["mathematics", "calculus", "algebra"],
    "subjectGrade": 12,
    "subjectVerification": false,
    "teacherVerification": [
      "https://coachacademic.s3.ap-southeast-1.amazonaws.com/users/cmbfe7kcx0000sbbx9u9hxc0p/subject/aefca072-329b-41a2-aed6-afde60148981/pdf1/certificate.pdf",
      "https://coachacademic.s3.ap-southeast-1.amazonaws.com/users/cmbfe7kcx0000sbbx9u9hxc0p/subject/aefca072-329b-41a2-aed6-afde60148981/pdf2/qualification.pdf"
    ],
    "createdAt": "2025-06-05T06:03:43.328Z",
    "userId": "cmbfe7kcx0000sbbx9u9hxc0p",
    "user": {
      "id": "cmbfe7kcx0000sbbx9u9hxc0p",
      "name": "Dr. Sarah Johnson",
      "email": "sarah.johnson@email.com",
      "profileImage": "https://coachacademic.s3.ap-southeast-1.amazonaws.com/users/cmbfe7kcx0000sbbx9u9hxc0p/profileImage/photo.webp",
      "isTeacher": true
    }
  };

const SingleSubjectVerification = () => {
  const navigate = useNavigate();
  const { subjectId } = useParams();
  const [subject, setSubject] = useState(defaultSubject);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubject = async () => {
      const response = await axiosWithAuth.get(`${ipUrl}/api/subjects/${subjectId}`);
      setSubject(response.data);
    };
    fetchSubject();
  }, []);

  // Sample data for demonstration
 

  const currentSubject = subject || defaultSubject;

  const handleAccept = async () => {
    try {
      setLoading(true);
      setError(null);
      await axiosWithAuth.put(`${ipUrl}/api/subjects/verify/${subjectId}`);
      navigate('/super-admin/dashboard');
    } catch (err) {
      setError('Failed to verify subject. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'AED'
    }).format(price / 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-stone-50 to-neutral-100 p-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Floating Error */}
        {error && (
          <div className="fixed top-4 right-4 bg-orange-400 text-orange-50 px-6 py-3 rounded-2xl shadow-lg z-50">
            {error}
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg overflow-hidden border border-gray-200/50">
          
          {/* Hero Section */}
          <div className="relative h-80 bg-gradient-to-r from-gray-400 via-stone-400 to-slate-400 overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-32 -translate-x-32"></div>
            
            <div className="relative z-10 p-8 h-full flex items-end">
              <div className="flex items-end space-x-6 w-full">
                <div className="relative">
                  <img
                    src={currentSubject.subjectImage}
                    alt={currentSubject.subjectName}
                    className="w-32 h-32 rounded-2xl object-cover border-4 border-white/30 shadow-lg"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/128x128?text=📚';
                    }}
                  />
                  <div className="absolute -top-2 -right-2">
                    {currentSubject.subjectVerification ? (
                      <div className="bg-emerald-400 text-white p-2 rounded-full shadow-md">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                    ) : (
                      <div className="bg-amber-400 text-white p-2 rounded-full shadow-md">
                        <Clock className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex-1 text-white pb-2">
                  <h1 className="text-4xl font-bold mb-2 drop-shadow-sm">
                    {currentSubject.subjectName}
                  </h1>
                  {currentSubject.subjectNameSubHeading && (
                    <p className="text-xl text-white/90 mb-3 drop-shadow-sm">
                      {currentSubject.subjectNameSubHeading}
                    </p>
                  )}
                  <div className="flex items-center space-x-4 text-white/80">
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm backdrop-blur">
                      {currentSubject.subjectBoard}
                    </span>
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm backdrop-blur">
                      Grade {currentSubject.subjectGrade}
                    </span>
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm backdrop-blur">
                      {formatDate(currentSubject.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8 p-8">
            
            {/* Left Column - Details */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Description */}
              <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl p-6 border border-gray-200/60">
                <h3 className="text-xl font-semibold text-gray-700 mb-3">Course Description</h3>
                <p className="text-gray-600 leading-relaxed">{currentSubject.subjectDescription}</p>
              </div>

              {/* Key Points */}
              {currentSubject.subjectPoints && currentSubject.subjectPoints.length > 0 && (
                <div className="bg-gradient-to-r from-emerald-50/60 to-teal-50/60 rounded-2xl p-6 border border-emerald-200/40">
                  <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                    <Star className="w-5 h-5 mr-2 text-amber-400" />
                    What You'll Learn
                  </h3>
                  <div className="grid gap-3">
                    {currentSubject.subjectPoints.map((point, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-emerald-400 rounded-full flex items-center justify-center mt-0.5">
                          <span className="text-white text-xs font-bold">{index + 1}</span>
                        </div>
                        <span className="text-gray-600 font-medium">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Teacher Info */}
              <div className="bg-gradient-to-r from-violet-50/60 to-purple-50/60 rounded-2xl p-6 border border-violet-200/40">
                <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-violet-400" />
                  Instructor
                </h3>
                
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={currentSubject.user?.profileImage}
                      alt={currentSubject.user?.name}
                      className="w-16 h-16 rounded-full object-cover border-3 border-white shadow-md"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/64x64?text=👤';
                      }}
                    />
                    {currentSubject.user?.isTeacher && (
                      <div className="absolute -bottom-1 -right-1 bg-slate-400 text-white p-1 rounded-full">
                        <Award className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-700 text-lg">{currentSubject.user?.name}</h4>
                    <p className="text-gray-500">{currentSubject.user?.email}</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mt-2 ${
                      currentSubject.user?.isTeacher 
                        ? 'bg-emerald-100/80 text-emerald-700' 
                        : 'bg-gray-100/80 text-gray-600'
                    }`}>
                      {currentSubject.user?.isTeacher ? '✓ Verified Instructor' : 'Student'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Quick Info & Actions */}
            <div className="space-y-6">
              
              {/* Quick Stats */}
              <div className="bg-white/90 rounded-2xl p-6 shadow-md border border-gray-200/60">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Course Details</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-emerald-50/70 rounded-xl">
                    <div className="flex items-center space-x-3">
                      
                      <span className="text-gray-600">Price</span>
                    </div>
                    <span className="font-bold text-xl text-emerald-600">
                      {formatPrice(currentSubject.subjectPrice)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-slate-50/70 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-slate-500" />
                      <span className="text-gray-600">Duration</span>
                    </div>
                    <span className="font-bold text-slate-600">
                      {currentSubject.subjectDuration}h
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-violet-50/70 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <Globe className="w-5 h-5 text-violet-500" />
                      <span className="text-gray-600">Language</span>
                    </div>
                    <span className="font-bold text-violet-600">
                      {currentSubject.subjectLanguage}
                    </span>
                  </div>
                </div>
              </div>

              {/* Documents */}
              {currentSubject.teacherVerification && currentSubject.teacherVerification.length > 0 && (
                <div className="bg-white/90 rounded-2xl p-6 shadow-md border border-gray-200/60">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-slate-500" />
                    Verification Docs
                  </h3>
                  
                  <div className="space-y-3">
                    {currentSubject.teacherVerification.map((doc, index) => (
                      <button
                        key={index}
                        onClick={() => window.open(doc, '_blank')}
                        className="w-full flex items-center justify-between p-3 bg-slate-50/70 hover:bg-slate-100/70 rounded-xl transition-all duration-200 group"
                      >
                        <span className="text-slate-600 font-medium">
                          Document {index + 1}
                        </span>
                        <div className="w-8 h-8 bg-slate-400 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
                          <FileText className="w-4 h-4 text-white" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="bg-white/90 rounded-2xl p-6 shadow-md border border-gray-200/60">
                {!currentSubject.subjectVerification ? (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Review Actions</h3>
                    
                    <button
                      onClick={handleAccept}
                      disabled={loading}
                      className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-md"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span>{loading ? 'Approving...' : 'Approve Course'}</span>
                    </button>
                    
                    {/* <button
                      onClick={handleReject}
                      disabled={loading}
                      className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-orange-400 to-red-400 hover:from-orange-500 hover:to-red-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-md"
                    >
                      <XCircle className="w-5 h-5" />
                      <span>{loading ? 'Rejecting...' : 'Reject Course'}</span>
                    </button> */}
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-emerald-100/80 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-emerald-700 mb-2">Course Approved!</h3>
                    <p className="text-emerald-600">This course has been successfully verified and is now live.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleSubjectVerification;