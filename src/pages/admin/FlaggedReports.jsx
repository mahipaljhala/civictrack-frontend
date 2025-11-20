import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { issueService } from '../../services/issue.service';
import IssueCard from '../../components/issue/IssueCard';
import { handleApiError } from '../../utils/errorHandler';
import { formatDate } from '../../utils/helpers';

const FlaggedReports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hidingReportId, setHidingReportId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFlaggedReports();
  }, []);

  const loadFlaggedReports = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await issueService.listFlaggedReports();
      console.log('Flagged reports response:', response);
      
      const reportsData = response.data?.data?.reports || 
                         response.data?.reports || 
                         response.data?.data || 
                         [];
      
      console.log('Loaded flagged reports:', reportsData);
      setReports(reportsData);
    } catch (err) {
      console.error('Failed to load flagged reports:', err);
      console.error('Error response:', err.response);
      setError('Failed to load flagged reports: ' + handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleHideReport = async (reportId, reportTitle) => {
    if (!window.confirm(`Are you sure you want to hide the report "${reportTitle}"? This will hide it from public view.`)) {
      return;
    }

    try {
      setHidingReportId(reportId);
      setError('');
      await issueService.hideReport(reportId);
      
      // Remove the hidden report from the list
      setReports(reports.filter(report => report.id !== reportId));
      
      alert('Report hidden successfully. It will no longer appear in public listings.');
    } catch (err) {
      console.error('Failed to hide report:', err);
      const errorMessage = handleApiError(err);
      setError(`Failed to hide report: ${errorMessage}`);
      alert(`Failed to hide report: ${errorMessage}`);
    } finally {
      setHidingReportId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading flagged reports...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Flagged Reports</h1>
        <p className="text-gray-600 mt-2">
          Review reports that have been flagged by users for inappropriate content or violations
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={() => setError('')}
            className="text-red-600 hover:text-red-800 font-bold"
          >
            ×
          </button>
        </div>
      )}

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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No flagged reports</h3>
          <p className="text-gray-500">
            All reports are clean! There are no flagged reports requiring review at this time.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-gray-600">
            Showing <span className="font-semibold">{reports.length}</span> flagged report{reports.length !== 1 ? 's' : ''} requiring review
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <div key={report.id} className="relative">
                {/* Flag indicator badge */}
                {report.flags && report.flags.length > 0 && (
                  <div className="absolute top-2 right-2 z-10 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-lg">
                    {report.flags.length} flag{report.flags.length !== 1 ? 's' : ''}
                  </div>
                )}
                <IssueCard report={report} onUpdate={loadFlaggedReports} />
                
                {/* Flag details and actions */}
                {report.flags && report.flags.length > 0 && (
                  <div className="mt-2 space-y-2">
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-xs font-semibold text-red-800 mb-2">Flagged for:</p>
                      {report.flags.map((flag, index) => (
                        <div key={index} className="text-xs text-red-700 mb-1">
                          <span className="font-medium">
                            {flag.flag?.name || 'Unknown flag type'}
                          </span>
                          {flag.user && (
                            <span className="text-red-600 ml-1">
                              by {flag.user.name}
                            </span>
                          )}
                          {flag.created_at && (
                            <span className="text-red-500 ml-1 text-xs">
                              ({formatDate(flag.created_at)})
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {/* Hide Report Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleHideReport(report.id, report.title);
                      }}
                      disabled={hidingReportId === report.id}
                      className="w-full px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                      {hidingReportId === report.id ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Hiding...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                          Hide Report
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default FlaggedReports;

