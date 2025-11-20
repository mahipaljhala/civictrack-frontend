import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { issueService } from '../../services/issue.service';

const AuthorityDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    reported: 0,
    inProgress: 0,
    resolved: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssignedIssues();
  }, []);

  const loadAssignedIssues = async () => {
    try {
      setLoading(true);
      console.log('Loading assigned issues for authority dashboard...');
      const response = await issueService.listReports();
      console.log('Assigned issues response:', response);
      
      const reports = response.data?.data?.reports || 
                     response.data?.reports || 
                     response.data?.data || 
                     [];
      
      console.log('Reports loaded:', reports);
      console.log('Number of reports:', reports.length);
      
      // Calculate statistics for assigned issues
      const assignedStats = {
        total: reports.length,
        reported: reports.filter(r => r.status === 'reported').length,
        inProgress: reports.filter(r => r.status === 'in_progress').length,
        resolved: reports.filter(r => r.status === 'resolved').length,
      };
      
      console.log('Calculated stats:', assignedStats);
      setStats(assignedStats);
    } catch (err) {
      console.error('Failed to load assigned issues:', err);
      console.error('Error response:', err.response);
      console.error('Error data:', err.response?.data);
      // Set loading to false even on error
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome, {user?.name}!
        </h1>
        <p className="text-lg text-gray-600">
          Authority Dashboard
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {loading ? (
          <div className="col-span-4 bg-white rounded-lg shadow p-4">
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Loading statistics...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Assigned Issues</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
              <div className="text-2xl font-bold text-gray-900">{stats.reported}</div>
              <div className="text-sm text-gray-600">Reported</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
              <div className="text-2xl font-bold text-gray-900">{stats.inProgress}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
              <div className="text-2xl font-bold text-gray-900">{stats.resolved}</div>
              <div className="text-sm text-gray-600">Resolved</div>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/"
          className="bg-blue-600 text-white p-6 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
        >
          <h2 className="text-xl font-semibold mb-2">Assigned Issues</h2>
          <p className="text-blue-100">
            View and manage issues assigned to your authority
          </p>
        </Link>

        <Link
          to="/issues"
          className="bg-green-600 text-white p-6 rounded-lg shadow-md hover:bg-green-700 transition-colors"
        >
          <h2 className="text-xl font-semibold mb-2">All Issues</h2>
          <p className="text-green-100">
            Browse all reported issues
          </p>
        </Link>
      </div>
    </div>
  );
};

export default AuthorityDashboard;

