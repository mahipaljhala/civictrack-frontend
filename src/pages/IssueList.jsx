import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { issueService } from '../services/issue.service';
import IssueCard from '../components/issue/IssueCard';
import { handleApiError } from '../utils/errorHandler';

const IssueList = () => {
  const { user, isCitizen } = useAuth();
  const [reports, setReports] = useState([]);
  const [allReports, setAllReports] = useState([]); // Store all reports for filtering
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadCategories();
    loadReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [statusFilter, searchQuery, categoryFilter, allReports]);

  const loadCategories = async () => {
    try {
      const response = await issueService.listCategories();
      const categoriesData = response.data?.data?.categories || 
                            response.data?.categories || 
                            response.data?.data || 
                            [];
      setCategories(categoriesData);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

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
      
      console.log('Extracted reports:', reportsData);
      console.log('Number of reports:', reportsData.length);
      
      setAllReports(reportsData);
      setReports(reportsData);
    } catch (err) {
      console.error('Failed to load reports:', err);
      console.error('Error details:', err.response?.data);
      console.error('Error status:', err.response?.status);
      const errorMessage = handleApiError(err);
      console.error('Error message:', errorMessage);
      if (err.response?.status !== 200) {
        alert('Failed to load issues: ' + errorMessage);
      }
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

    // Filter by category
    if (categoryFilter) {
      const categoryId = parseInt(categoryFilter);
      filtered = filtered.filter(report => {
        // Check all possible field names for the category/issue ID
        const reportIssueId = report.issue_id || 
                             report.issueId || 
                             report.issue?.id || 
                             null;
        
        // Convert to number if it's a string, then compare
        const reportIdNum = reportIssueId ? parseInt(reportIssueId) : null;
        
        console.log(`Filtering report ${report.id}: categoryId=${categoryId}, reportIssueId=${reportIssueId}, reportIdNum=${reportIdNum}, match=${reportIdNum === categoryId}`);
        
        return reportIdNum === categoryId;
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(report => 
        report.title?.toLowerCase().includes(query) ||
        report.description?.toLowerCase().includes(query) ||
        report.city?.toLowerCase().includes(query) ||
        report.region?.toLowerCase().includes(query)
      );
    }

    setReports(filtered);
  };

  // Calculate statistics
  const stats = {
    total: allReports.length,
    reported: allReports.filter(r => r.status === 'reported').length,
    inProgress: allReports.filter(r => r.status === 'in_progress').length,
    resolved: allReports.filter(r => r.status === 'resolved').length,
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading issues...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Community Issues
        </h1>
        <p className="text-lg text-gray-600">
          Track and monitor civic issues in your community
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Issues</div>
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
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              id="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, description, city..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="reported">Reported</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              id="category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        {(statusFilter || searchQuery || categoryFilter) && (
          <div className="mt-4">
            <button
              onClick={() => {
                setStatusFilter('');
                setSearchQuery('');
                setCategoryFilter('');
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-600">
          {reports.length === allReports.length ? (
            <>Showing all <span className="font-semibold">{reports.length}</span> issues</>
          ) : (
            <>Showing <span className="font-semibold">{reports.length}</span> of <span className="font-semibold">{allReports.length}</span> issues</>
          )}
        </p>
        {isCitizen && (
          <button
            onClick={() => navigate('/report')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Report New Issue
          </button>
        )}
      </div>

      {/* Issues Grid */}
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">No issues found</h3>
          <p className="text-gray-500 mb-4">
            {allReports.length === 0
              ? 'There are no issues reported yet. Be the first to report an issue!'
              : 'Try adjusting your filters to see more results.'}
          </p>
          {isCitizen && allReports.length === 0 && (
            <button
              onClick={() => navigate('/report')}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Report an Issue
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <div
              key={report.id}
              onClick={() => navigate(`/issues/${report.id}`)}
              className="cursor-pointer h-full"
            >
              <IssueCard report={report} onUpdate={loadReports} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IssueList;

