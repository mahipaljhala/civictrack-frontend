import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { issueService } from '../../services/issue.service';
import IssueCard from '../../components/issue/IssueCard';
import { handleApiError } from '../../utils/errorHandler';

const AssignedIssues = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadReports();
  }, [statusFilter]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const params = statusFilter ? { status: statusFilter } : {};
      const response = await issueService.listReports(params);
      console.log('API Response:', response);
      console.log('Response data:', response.data);
      
      // Try different possible response structures
      const reports = response.data?.data?.reports || 
                      response.data?.reports || 
                      response.data?.data || 
                      [];
      
      console.log('Extracted reports:', reports);
      setReports(reports);
    } catch (err) {
      console.error('Failed to load reports:', err);
      console.error('Error details:', err.response?.data);
    } finally {
      setLoading(false);
    }
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Assigned Issues</h1>
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
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No assigned issues found</p>
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

export default AssignedIssues;

