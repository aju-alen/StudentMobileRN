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

  const handleVerifySubject = (subjectId: string) => {
    navigate(`/super-admin/verify-subject/${subjectId}`);
  };

  const handleViewReport = (reportId: string) => {
    navigate(`/super-admin/report/${reportId}`);
  };

  useEffect(() => {
    setStats({
      totalResponses: 1234,
      completionRate: 85,
      averageTime: 12.5,
      lastUpdated: new Date().toLocaleDateString(),
    });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('superAdminDetails');
    localStorage.removeItem('superAdminToken');
    navigate('/login');
  };

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
      <header className="bg-white shadow border-b border-gray-100 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
        </div>
        <div className="flex items-center space-x-4">
          {/* Avatar Placeholder */}
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg border border-blue-200 shadow-sm">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 8-4 8-4s8 0 8 4" />
            </svg>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Logout"
          >
            Logout
          </button>
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
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('subjects')}
              className={`${
                activeTab === 'subjects'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition`}
            >
              Verify Subjects
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {loading && (
          <div className="flex justify-center items-center py-10">
            <span className="text-blue-600 font-medium">Loading...</span>
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        {!loading && activeTab === 'overview' ? (
          <>
            {/* Stats Grid */}
            {/* <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {statCards.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition"
                >
                  <div className="p-5 flex items-center">
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
              ))}
            </div> */}

            {/* Additional Content Sections */}
            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Response Trends */}
              <div className="bg-white shadow rounded-xl p-6 flex flex-col">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUpIcon className="w-5 h-5 text-blue-500" />
                  Response Trends
                </h2>
                <div className="h-64 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center relative">
                  {/* Placeholder SVG Chart */}
                  <svg width="90%" height="80%" viewBox="0 0 300 120" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-80">
                    <polyline
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="4"
                      points="0,100 40,80 80,90 120,60 160,70 200,30 240,50 280,20"
                    />
                    <circle cx="280" cy="20" r="6" fill="#3b82f6" />
                  </svg>
                  <p className="text-gray-400 z-10">Chart will be displayed here</p>
                </div>
              </div>

              {/* Recent Reports */}
              <div className="bg-white shadow rounded-xl p-6 flex flex-col">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileTextIcon className="w-5 h-5 text-purple-500" />
                  Recent Reports
                </h2>
                <div className="space-y-4 flex-1">
                  {reports.length === 0 ? (
                    <div className="text-gray-400 text-center py-10">
                      No recent reports found.
                    </div>
                  ) : (
                    reports.slice(0, 5).map((report) => (
                      <div
                        key={report.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition group border border-transparent hover:border-blue-200"
                      >
                        <div className="flex items-center gap-3">
                          {/* Avatar Placeholder */}
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                            {report.reportType?.[0] || "R"}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 line-clamp-1">
                              {report.reportDescription}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500">
                                Submitted {new Date(report.createdAt).toLocaleString()}
                              </span>
                              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold
                                ${report.reportStatus === "Resolved"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"}
                              `}>
                                {report.reportStatus}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleViewReport(report.id)}
                          className="text-blue-600 hover:text-white hover:bg-blue-600 border border-blue-600 text-sm font-medium bg-blue-50 px-3 py-1 rounded transition focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                          View Details
                        </button>
                      </div>
                    ))
                  )}
                </div>
                {reports.length > 5 && (
                  <button
                    onClick={() => navigate('/super-admin/reports')}
                    className="mt-6 self-center text-blue-700 hover:text-white hover:bg-blue-700 border border-blue-700 text-sm font-medium bg-blue-50 px-4 py-2 rounded transition focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    View All Reports
                  </button>
                )}
              </div>
            </div>
          </>
        ) : !loading && activeTab === 'subjects' ? (
          <div className="overflow-x-auto mt-4">
            <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Board
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subjects.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                      No subjects found.
                    </td>
                  </tr>
                ) : (
                  subjects.map((subject, idx) => (
                    <tr
                      key={subject.id}
                      className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    >
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
                          <button
                            onClick={() => handleVerifySubject(subject.id)}
                            className="text-green-700 hover:text-white hover:bg-green-600 border border-green-600 text-sm font-medium bg-green-100 px-3 py-1 rounded-md transition"
                          >
                            Verify Subject
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : null}
      </main>
    </div>
  );
};

export default Dashboard;