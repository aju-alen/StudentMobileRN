import { ArrowLeft, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center">
          {/* 404 Text */}
          <h1 className="text-9xl font-bold text-indigo-600 mb-4">404</h1>
          
          {/* Message */}
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Oops! Page Not Found
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            The page you're looking for doesn't exist or has been moved. Let's get you back on track to your learning journey.
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/"
              className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full font-medium transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Home size={20} className="mr-2" />
              Back to Home
            </Link>
            <button 
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center bg-white hover:bg-gray-50 border border-gray-200 hover:border-indigo-300 text-gray-700 px-8 py-3 rounded-full font-medium transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <ArrowLeft size={20} className="mr-2" />
              Go Back
            </button>
          </div>
          
          {/* Decorative Elements */}
          <div className="mt-16 relative">
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-indigo-100 rounded-full blur-3xl opacity-30"></div>
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-30"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 