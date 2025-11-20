import { useState, useEffect } from 'react';
import api from '../../services/api';

const FlagModal = ({ isOpen, onClose, onConfirm, reportId, existingFlag }) => {
  const [flags, setFlags] = useState([]);
  const [selectedFlagId, setSelectedFlagId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Pre-select existing flag if user has already flagged
      if (existingFlag && existingFlag.flag_id) {
        setSelectedFlagId(existingFlag.flag_id.toString());
      } else {
        setSelectedFlagId('');
      }
      setError('');
      loadFlags();
    }
  }, [isOpen, existingFlag]);

  const loadFlags = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/issues/flags');
      console.log('Flags API response:', response);
      
      // Extract flags from response
      const flagsData = response.data?.data?.flags || 
                       response.data?.flags || 
                       response.data?.data || 
                       [];
      
      console.log('Loaded flags:', flagsData);
      
      if (flagsData.length > 0) {
        setFlags(flagsData);
      } else {
        console.warn('No flags returned from API');
        setError('No flag types available');
      }
    } catch (err) {
      console.error('Failed to load flags:', err);
      console.error('Error response:', err.response?.data);
      setError('Failed to load flag types. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedFlagId) {
      setError('Please select a flag type');
      return;
    }
    setError('');
    onConfirm(parseInt(selectedFlagId));
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">
          {existingFlag ? 'Update Flag' : 'Flag Issue Report'}
        </h2>
        <p className="text-gray-600 mb-4">
          {existingFlag 
            ? 'You have already flagged this report. Select a different flag type to update it:'
            : 'Please select a reason for flagging this report:'}
        </p>

        {loading ? (
          <div className="text-center py-4">Loading flag types...</div>
        ) : flags.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-red-600 mb-2">{error || 'No flag types available'}</p>
            <button
              onClick={loadFlags}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Flag Type
              </label>
              <select
                value={selectedFlagId}
                onChange={(e) => {
                  setSelectedFlagId(e.target.value);
                  setError('');
                }}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a flag type...</option>
                {flags.map((flag) => (
                  <option key={flag.id} value={flag.id}>
                    {flag.name} {flag.description ? `- ${flag.description}` : ''}
                  </option>
                ))}
              </select>
              {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleConfirm();
                }}
                disabled={!selectedFlagId}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {existingFlag ? 'Update Flag' : 'Flag Report'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FlagModal;

