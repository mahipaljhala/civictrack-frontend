import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { issueService } from '../../services/issue.service';
import IssueCard from '../../components/issue/IssueCard';
import { handleApiError } from '../../utils/errorHandler';

const MyReports = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [allReports, setAllReports] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Check for success message from navigation state
    if (location.state?.success && location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the location state so message doesn't persist on refresh
      window.history.replaceState({}, document.title);
      // Auto-hide success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  }, [location]);

  useEffect(() => {
    if (user) {
      loadReports();
    }
  }, [user]);

  useEffect(() => {
    if (user && allReports.length > 0) {
      filterReports();
    }
  }, [statusFilter, allReports, user]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await issueService.listReports();
      console.log('API Response:', response);
      console.log('Response data:', response.data);
      
      // Try different possible response structures
      const reportsData = response.data?.data?.reports || 
                         response.data?.reports || 
                         response.data?.data || 
                         [];
      
      console.log('All reports from API:', reportsData);
      console.log('Current user ID:', user?.id);
      
      // Filter reports to only show the current user's reports
      const myReports = reportsData.filter(report => {
        const reporterId = report.reporter_id || report.reporter?.id || report.reporterId;
        const userId = user?.id;
        console.log(`Report ${report.id}: reporterId=${reporterId}, userId=${userId}, match=${reporterId === userId}`);
        return reporterId === userId;
      });
      
      console.log('Filtered my reports:', myReports);
      setAllReports(myReports);
      setReports(myReports);
    } catch (err) {
      console.error('Failed to load reports:', err);
      console.error('Error details:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const filterReports = () => {
    let filtered = [...allReports];

    // Filter by status
    if (statusFilter) {
      filtered = filtered.filter(report => report.status === statusFilter);
    }

    setReports(filtered);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded mb-4 flex justify-between items-center">
          <span>{successMessage}</span>
          <button
            onClick={() => setSuccessMessage('')}
            className="text-green-600 hover:text-green-800 font-bold"
          >
            ×
          </button>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Reports</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md"
        >
          <option value="">All Statuses</option>
          <option value="reported">Reported</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {reports.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
          <p className="text-gray-500 mb-4">
            {allReports.length === 0
              ? "You haven't reported any issues yet. Click the button below to report your first issue!"
              : 'No reports match the selected filter. Try changing the status filter.'}
          </p>
          {allReports.length === 0 && (
            <button
              onClick={() => navigate('/report')}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Report an Issue
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="mb-4 text-gray-600">
            Showing <span className="font-semibold">{reports.length}</span> of{' '}
            <span className="font-semibold">{allReports.length}</span> report
            {allReports.length !== 1 ? 's' : ''}
            {statusFilter && ` with status "${statusFilter}"`}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <IssueCard key={report.id} report={report} onUpdate={loadReports} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default MyReports;

