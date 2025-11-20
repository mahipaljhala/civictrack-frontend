import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { issueService } from '../services/issue.service';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/common/StatusBadge';
import { formatDate } from '../utils/helpers';
import { handleApiError } from '../utils/errorHandler';

const IssueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthority, isAdmin } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [comment, setComment] = useState('');
  const [updating, setUpdating] = useState(false);
  const [deletingFlagId, setDeletingFlagId] = useState(null);

  useEffect(() => {
    loadReport();
  }, [id]);

  const loadReport = async () => {
    try {
      setLoading(true);
      console.log('Loading report with ID:', id);
      
      // Try the direct endpoint first
      try {
        const response = await issueService.getReport(id);
        console.log('Report response:', response);
        console.log('Report data:', response.data);
        
        // Try different possible response structures
        const reportData = response.data?.data?.report || 
                          response.data?.report || 
                          response.data?.data || 
                          response.data;
        
        console.log('Extracted report:', reportData);
        
        if (reportData && reportData.id) {
          setReport(reportData);
          setStatus(reportData.status);
          return;
        }
      } catch (directErr) {
        console.log('Direct endpoint failed, trying list endpoint:', directErr);
      }
      
      // Fallback: Get from list and find by ID
      console.log('Fetching from list endpoint as fallback...');
      const listResponse = await issueService.listReports();
      console.log('List response:', listResponse);
      
      const reports = listResponse.data?.data?.reports || 
                     listResponse.data?.reports || 
                     listResponse.data?.data || 
                     [];
      
      console.log('All reports:', reports);
      const foundReport = reports.find(r => r.id === parseInt(id) || r.id === id);
      
      if (foundReport) {
        console.log('Found report:', foundReport);
        setReport(foundReport);
        setStatus(foundReport.status);
      } else {
        console.error('Report not found in list. ID:', id, 'Available IDs:', reports.map(r => r.id));
      }
    } catch (err) {
      console.error('Failed to load report:', err);
      console.error('Error response:', err.response);
      console.error('Error details:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      setUpdating(true);
      await issueService.updateStatus(id, {
        status,
        comment: comment || undefined,
      });
      await loadReport();
      setComment('');
      alert('Status updated successfully');
    } catch (err) {
      alert(handleApiError(err));
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteFlag = async (flagId, flagName) => {
    if (!window.confirm(`Are you sure you want to delete this flag "${flagName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingFlagId(flagId);
      await issueService.deleteFlag(flagId, id);
      
      // Reload the report to get updated flags
      await loadReport();
      
      alert('Flag deleted successfully.');
    } catch (err) {
      console.error('Failed to delete flag:', err);
      alert('Failed to delete flag: ' + handleApiError(err));
    } finally {
      setDeletingFlagId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Report not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-600 hover:text-blue-800"
      >
        ← Back
      </button>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold text-gray-900">{report.title}</h1>
          <StatusBadge status={report.status} />
        </div>

        <div className="mb-4">
          <p className="text-gray-600 whitespace-pre-wrap">{report.description}</p>
        </div>

        {report.issue && (
          <div className="mb-4">
            <span className="inline-block bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded">
              {report.issue.name}
            </span>
          </div>
        )}

        {report.images && report.images.length > 0 && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Images</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {report.images.map((img) => (
                <img
                  key={img.id}
                  src={img.url}
                  alt="Issue"
                  className="w-full h-48 object-cover rounded"
                />
              ))}
            </div>
          </div>
        )}

        {report.latitude && report.longitude && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Location: {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
            </p>
            {report.region && <p className="text-sm text-gray-600">Region: {report.region}</p>}
          </div>
        )}

        {report.reporter && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Reported by: {report.reporter.name} ({report.reporter.email})
            </p>
          </div>
        )}

        {report.authority && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Assigned to: {report.authority.name} - {report.authority.city}, {report.authority.region}
            </p>
          </div>
        )}

        <div className="mb-4 text-sm text-gray-500">
          <p>Created: {formatDate(report.created_at)}</p>
          <p>Updated: {formatDate(report.updated_at)}</p>
        </div>

        {(isAuthority || isAdmin) && (
          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold mb-4">Update Status</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="reported">Reported</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comment (Optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Add a comment about the status update"
                />
              </div>
              <button
                onClick={handleStatusUpdate}
                disabled={updating}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {updating ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        )}

        {report.logs && report.logs.length > 0 && (
          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold mb-4">Status History</h3>
            <div className="space-y-2">
              {report.logs.map((log) => (
                <div key={log.id} className="text-sm text-gray-600 border-l-2 pl-4">
                  <p>
                    {log.from_status && log.to_status ? (
                      <>Status changed from <strong>{log.from_status}</strong> to <strong>{log.to_status}</strong></>
                    ) : (
                      <>Status updated</>
                    )}
                  </p>
                  {log.comment && <p className="text-gray-500 mt-1">{log.comment}</p>}
                  <p className="text-gray-400 text-xs mt-1">{formatDate(log.created_at)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Flags Section - Display for all users */}
        {report.flags && report.flags.length > 0 && (
          <div className="border-t pt-4 mt-4">
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-red-900">⚠️ Flagged Report Review</h3>
                <span className="bg-red-600 text-white text-sm font-semibold px-3 py-1 rounded-full">
                  {report.flags.length} Flag{report.flags.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Flag Count Summary by Type */}
              {(() => {
                const flagCounts = {};
                report.flags.forEach((flag) => {
                  const flagTypeName = flag.flag?.name || 'Unknown';
                  flagCounts[flagTypeName] = (flagCounts[flagTypeName] || 0) + 1;
                });

                return (
                  <div className="mb-6 p-4 bg-white rounded-md border border-red-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Flag Count by Type:</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(flagCounts).map(([flagType, count]) => (
                        <div
                          key={flagType}
                          className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {flagType}: <span className="font-bold">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* All Flags List */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">All Flags:</h4>
                {report.flags.map((flag, index) => (
                  <div
                    key={flag.id || index}
                    className="bg-white border border-red-300 rounded-md p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-red-900">
                            {flag.flag?.name || 'Unknown Flag Type'}
                          </span>
                          {flag.flag?.description && (
                            <span className="text-sm text-gray-600">
                              - {flag.flag.description}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          {flag.user && (
                            <p>
                              <span className="font-medium">Flagged by:</span>{' '}
                              {flag.user.name} ({flag.user.email})
                            </p>
                          )}
                          {flag.created_at && (
                            <p>
                              <span className="font-medium">Date:</span>{' '}
                              {formatDate(flag.created_at)}
                            </p>
                          )}
                        </div>
                      </div>
                      {/* Delete Flag Button - Admin only */}
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteFlag(flag.id, flag.flag?.name || 'this flag')}
                          disabled={deletingFlagId === flag.id}
                          className="ml-4 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete flag"
                        >
                          {deletingFlagId === flag.id ? (
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      )}
                    </div>
                    {/* Comments section - if comments exist in the API response */}
                    {flag.comment && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm font-medium text-gray-700 mb-1">Comment:</p>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-2 rounded">
                          {flag.comment}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Action Button - Admin only */}
              {isAdmin && (
                <div className="mt-6 pt-4 border-t border-red-300">
                  <button
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to hide this report? This will remove it from public view.')) {
                        try {
                          await issueService.hideReport(report.id);
                          alert('Report hidden successfully.');
                          navigate(-1);
                        } catch (err) {
                          alert('Failed to hide report: ' + handleApiError(err));
                        }
                      }
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors font-medium"
                  >
                    Hide Report
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IssueDetail;

