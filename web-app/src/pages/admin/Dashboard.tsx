import React, { useState, useEffect } from 'react';
import {
  BarChartIcon,
  UsersIcon,
  FileTextIcon,
  TrendingUpIcon,
} from 'lucide-react';
import { ipUrl } from '../../common/ipUrl';
import { axiosWithAuth } from '../../common/customAxios';
import { useNavigate } from 'react-router-dom';

interface SurveyStats {
  totalResponses: number;
  completionRate: number;
  averageTime: number;
  lastUpdated: string;
}

interface Subject {
  id: string;
  subjectName: string;
  subjectBoard: string;
  subjectVerification: boolean;
  createdAt: string;
}

interface Report {
  id: string;
  reportType: string;
  createdAt: string;
  reportDescription: string;
  reportResolution: string;
  reportStatus: string;
  subjectId: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'subjects'>('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<SurveyStats>({
    totalResponses: 0,
    completionRate: 0,
    averageTime: 0,
    lastUpdated: new Date().toLocaleDateString(),
  });
  const [reports, setReports] = useState<Report[]>([]);

  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Fetch subjects when tab changes to subjects
  useEffect(() => {
    if (activeTab === 'subjects') {
      fetchSubjects();
    }
    if (activeTab === 'overview') {
      fetchReports();
    }
  }, [activeTab]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosWithAuth.get(`${ipUrl}/api/subjects/verify`);
      setSubjects(response.data);
    } catch (err) {
      setError('Failed to fetch subjects. Please try again later.');
      console.error('Error fetching subjects:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosWithAuth.get(`${ipUrl}/api/reports`);
      setReports(response.data);
    } catch (err) {
      setError('Failed to fetch reports. Please try again later.');
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubject = async (subjectId: string) => {
    try {
     navigate(`/super-admin/verify-subject/${subjectId}`);
    } catch (err) {
      setError('Failed to verify subject. Please try again later.');
      console.error('Error verifying subject:', err);
    } finally {
      setLoading(false);
    }
  };



  // Mock data - replace with actual API calls
  useEffect(() => {
    // Simulate API call
    setStats({
      totalResponses: 1234,
      completionRate: 85,
      averageTime: 12.5,
      lastUpdated: new Date().toLocaleDateString(),
    });
  }, []);

  // const statCards = [
  //   {
  //     title: 'Total Responses',
  //     value: stats.totalResponses,
  //     icon: UsersIcon,
  //     color: 'bg-blue-500',
  //   },
  //   {
  //     title: 'Completion Rate',
  //     value: `${stats.completionRate}%`,
  //     icon: BarChartIcon,
  //     color: 'bg-green-500',
  //   },
  //   {
  //     title: 'Avg. Time',
  //     value: `${stats.averageTime} min`,
  //     icon: TrendingUpIcon,
  //     color: 'bg-purple-500',
  //   },
  //   {
  //     title: 'Last Updated',
  //     value: stats.lastUpdated,
  //     icon: FileTextIcon,
  //     color: 'bg-orange-500',
  //   },
  // ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('subjects')}
              className={`${
                activeTab === 'subjects'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Verify Subjects
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeTab === 'overview' ? (
          <>
            {/* Stats Grid */}
            {/* <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {statCards.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white overflow-hidden shadow rounded-lg"
                >
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}>
                        <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            {stat.title}
                          </dt>
                          <dd className="text-lg font-semibold text-gray-900">
                            {stat.value}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div> */}

            {/* Additional Content Sections */}
            <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
              {/* Response Trends */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Response Trends
                </h2>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Chart will be displayed here</p>
                </div>
              </div>

              {/* Recent Responses */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Recent Reports
                </h2>
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {report.reportDescription}
                        </p>
                        <p className="text-sm text-gray-500">
                          Submitted {report.createdAt} hours ago
                        </p>
                      </div>
                      <button onClick={() => handleViewReport(report.id)}className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Board
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Submitted
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {subjects.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                  No subjects found
                </td>
              </tr>
            ) : (
              subjects.map((subject) => (
                <tr key={subject.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {subject.subjectName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{subject.subjectBoard}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        subject.subjectVerification
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {subject.subjectVerification ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(subject.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {!subject.subjectVerification && (
                      <div className="flex space-x-2">
                       <button onClick={() => handleVerifySubject(subject.id)} className="text-green-600 hover:text-green-800 text-sm font-medium bg-green-100 px-2 py-1 rounded-md">Verify Subject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    )}
      </main>
    </div>
  );
};

export default Dashboard; 