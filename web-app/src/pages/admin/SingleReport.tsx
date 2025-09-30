import React, { useEffect, useState } from 'react';
import { AlertTriangle, FileText, MessageSquare } from 'lucide-react';
import { axiosWithAuth } from '../../common/customAxios';
import { ipUrl } from '../../common/ipUrl';
import { useParams } from 'react-router-dom';

type Report = {
  id: string;
  user: {
    name: string;
    email: string;
  };
  reportedSubject: {
    subjectName: string;
    subjectId: string;
  };
  reportDescription: string;
  status: string;
  createdAt: string ;
};

const  SingleReport= ()=> {
  const [resolution, setResolution] = useState('');
  const [report, setReport] = useState<Report >();
  const { reportId } = useParams();

  useEffect(() => {
    const fetchSingleReport = async () => {
        const response = await axiosWithAuth.get(`${ipUrl}/api/reports/single-report/${reportId}`);
        console.log('report response', response.data);
        setReport(response.data);
        
    }
    fetchSingleReport();
  }, []);

  console.log(report,'report in single report page');
  

  // Sample data based on the provided report
 

  const handleSubmit = () => {
    if (resolution.trim()) {
        try{
            // const response = axiosWithAuth.put(`${ipUrl}/api/reports/${}`)
        }
        catch(error){
          console.error('Error submitting resolution:', error);
        }
      // Here you would typically send the resolution to your backend
      console.log('Resolution submitted:', resolution);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="h-6 w-6 text-red-500" />
          <h1 className="text-2xl font-bold text-gray-900">Report Resolution</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            status === 'PENDING' 
              ? 'bg-yellow-100 text-yellow-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {status}
          </span>
        </div>
        
        <div className="text-sm text-gray-600 mb-4">
          Reported on {formatDate(report?.createdAt)} by {report?.user?.name}
        </div>
      </div>

      <div className="space-y-6">
        {/* Subject Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Reported Subject</h2>
          </div>
          <p className="text-xl font-medium text-blue-900">{report?.reportedSubject?.subjectName}</p>
        </div>

        {/* Report Description */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Report Description</h2>
          </div>
          <div className="bg-white border border-gray-200 rounded p-3">
            <p className="text-gray-800 leading-relaxed">{report.reportDescription}</p>
          </div>
        </div>

        {/* Resolution Input */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Resolution</h2>
          <div>
            <div className="mb-4">
              <label htmlFor="resolution" className="block text-sm font-medium text-gray-700 mb-2">
                Write your resolution for this report:
              </label>
              <textarea
                id="resolution"
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                placeholder="Describe the actions taken to resolve this report..."
                disabled={status === 'RESOLVED'}
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={!resolution.trim() || status === 'RESOLVED'}
                className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {status === 'RESOLVED' ? 'Resolved' : 'Submit Resolution'}
              </button>
              
              <button
                onClick={() => {
                  setResolution('');
                  setStatus('PENDING');
                }}
                className="px-6 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {status === 'RESOLVED' && (
          <div className="bg-green-100 border border-green-300 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-green-800 font-medium">Report has been resolved successfully!</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default SingleReport;