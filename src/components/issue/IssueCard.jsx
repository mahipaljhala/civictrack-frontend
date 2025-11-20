import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../common/StatusBadge';
import { formatDate, truncateText } from '../../utils/helpers';
import { issueService } from '../../services/issue.service';
import { handleApiError } from '../../utils/errorHandler';
import FlagModal from './FlagModal';

const IssueCard = ({ report, onUpdate }) => {
  const navigate = useNavigate();
  const { isCitizen, isAuthority, isAdmin, role, user } = useAuth();
  const [showFlagModal, setShowFlagModal] = useState(false);
  
  // Check if current user has already flagged this report
  const userFlag = report.flags?.find(flag => flag.user_id === user?.id || flag.user?.id === user?.id);

  const handleCardClick = () => {
    navigate(`/issues/${report.id}`);
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await issueService.updateStatus(report.id, {
        status: newStatus,
        comment: 'Status updated',
      });
      onUpdate?.();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status');
    }
  };

  const handleFlagClick = () => {
    setShowFlagModal(true);
  };

  const handleFlagConfirm = async (flagId) => {
    try {
      console.log('Flagging report:', report.id, 'with flagId:', flagId);
      console.log('Flag request:', { reportId: report.id, flagId });
      
      // If user has already flagged this report, delete the old flag first
      if (userFlag) {
        console.log('User has already flagged this report. Deleting old flag:', userFlag.id);
        try {
          await issueService.deleteFlag(userFlag.id, report.id);
          console.log('Old flag deleted successfully');
        } catch (deleteError) {
          console.error('Failed to delete old flag:', deleteError);
          // Continue anyway - might be a different flag or backend handles it
        }
      }
      
      // Create the new flag
      const response = await issueService.flagReport(report.id, flagId);
      console.log('Flag response:', response);
      
      setShowFlagModal(false);
      
      // Show success message
      const successMessage = userFlag 
        ? 'Flag updated successfully. Your previous flag has been replaced.'
        : (response.data?.message || 'Report flagged for review');
      alert(successMessage);
      
      // Refresh the reports list
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to flag report:', error);
      console.error('Flag error response:', error.response);
      console.error('Flag error status:', error.response?.status);
      console.error('Flag error data:', error.response?.data);
      
      const errorMessage = handleApiError(error);
      alert(`Failed to flag report: ${errorMessage}`);
      
      // Don't close modal on error so user can retry with different flag type
    }
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow h-full flex flex-col cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1 pr-2">{report.title}</h3>
        <StatusBadge status={report.status} />
      </div>

      <p className="text-gray-600 mb-3 line-clamp-3 min-h-[4.5rem]">{truncateText(report.description, 150)}</p>

      <div className="mb-3 flex-shrink-0">
        {report.issue && (
          <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
            {report.issue.name}
          </span>
        )}
      </div>

      <div className="mb-3 flex-shrink-0 min-h-[5rem]">
        {report.images && report.images.length > 0 ? (
          <div className="flex gap-2">
            {report.images.slice(0, 3).map((img) => (
              <img
                key={img.id}
                src={img.url}
                alt="Issue"
                className="w-20 h-20 object-cover rounded"
              />
            ))}
            {report.images.length > 3 && (
              <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-600">
                +{report.images.length - 3}
              </div>
            )}
          </div>
        ) : (
          <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center">
            <span className="text-gray-400 text-xs">No image</span>
          </div>
        )}
      </div>

      <div className="mt-auto space-y-1">
        {report.latitude && report.longitude && (
          <p className="text-sm text-gray-500">
            Location: {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
          </p>
        )}

        {report.reporter && (
          <p className="text-sm text-gray-500">
            Reported by: {report.reporter.name}
          </p>
        )}

        <div className="flex justify-between items-center text-sm text-gray-500 pt-2 border-t" onClick={(e) => e.stopPropagation()}>
          <span>{formatDate(report.created_at)}</span>
          <div className="flex gap-2">
            {(isAuthority || isAdmin) && (
              <select
                value={report.status}
                onChange={(e) => handleStatusUpdate(e.target.value)}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="reported">Reported</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
            )}
            {isCitizen && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleFlagClick();
                }}
                className={`text-sm font-medium ${
                  userFlag 
                    ? 'text-orange-600 hover:text-orange-800' 
                    : 'text-red-600 hover:text-red-800'
                }`}
                title={userFlag ? 'You have already flagged this report. Click to change your flag type.' : 'Flag this report'}
              >
                {userFlag ? 'Update Flag' : 'Flag'}
              </button>
            )}
          </div>
        </div>
      </div>

      <FlagModal
        isOpen={showFlagModal}
        onClose={() => setShowFlagModal(false)}
        onConfirm={handleFlagConfirm}
        reportId={report.id}
        existingFlag={userFlag}
      />
    </div>
  );
};

export default IssueCard;

