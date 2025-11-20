import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { issueService } from '../../services/issue.service';
import ImageUpload from '../../components/forms/ImageUpload';
import { handleApiError } from '../../utils/errorHandler';

const ReportIssue = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [issueId, setIssueId] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await issueService.listCategories();
      setCategories(response.data.data.categories || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const handleImageUpload = (files) => {
    setImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate title
    if (!title || !title.trim()) {
      setError('Please enter a title for this issue.');
      setLoading(false);
      return;
    }

    if (title.trim().length < 5) {
      setError('Title must be at least 5 characters long. Please provide a brief description.');
      setLoading(false);
      return;
    }

    // Validate description
    if (!description || !description.trim()) {
      setError('Please provide a description of the issue.');
      setLoading(false);
      return;
    }

    if (description.trim().length < 10) {
      setError('Description must be at least 10 characters long. Please provide more details about the issue.');
      setLoading(false);
      return;
    }

    // Validate category
    if (!issueId) {
      setError('Please select a category for this issue.');
      setLoading(false);
      return;
    }

    // Validate city (now required)
    if (!city || !city.trim()) {
      setError('City is required. Please enter the city where this issue is located.');
      setLoading(false);
      return;
    }

    // Validate region (now required)
    if (!region || !region.trim()) {
      setError('Region/Zone is required. Please enter the region or zone where this issue is located.');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('issueId', issueId);
      formData.append('city', city.trim());
      formData.append('region', region.trim());
      
      if (latitude) formData.append('latitude', latitude);
      if (longitude) formData.append('longitude', longitude);

      images.forEach((image) => {
        formData.append('images', image);
      });

      const response = await issueService.createReport(formData);
      
      // Handle authority assignment status
      const report = response.data?.data?.report || response.data?.report;
      if (report && report.authority) {
        // Authority was automatically assigned
        navigate('/my-reports', { 
          state: { 
            success: true, 
            message: `Issue reported successfully! Assigned to: ${report.authority.name} (${report.authority.city}, ${report.authority.region})` 
          } 
        });
      } else {
        // No authority assigned - will be assigned by admin
        navigate('/my-reports', { 
          state: { 
            success: true, 
            message: 'Issue reported successfully! An admin will review and assign an authority shortly.' 
          } 
        });
      }
    } catch (err) {
      setError(handleApiError(err));
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Report an Issue</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Brief description of the issue"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description <span className="text-red-600">*</span>
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Detailed description of the issue"
          />
        </div>

        <div>
          <label htmlFor="issueId" className="block text-sm font-medium text-gray-700 mb-2">
            Category <span className="text-red-600">*</span>
          </label>
          <select
            id="issueId"
            value={issueId}
            onChange={(e) => setIssueId(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
              City <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Jaipur"
            />
          </div>
          <div>
            <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-2">
              Region/Zone <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Mansarovar"
            />
            <p className="mt-1 text-xs text-gray-500">
              Authority will be automatically assigned based on category, city, and region
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-2">
              Latitude (Optional)
            </label>
            <input
              type="number"
              step="any"
              id="latitude"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="40.7128"
            />
          </div>
          <div>
            <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-2">
              Longitude (Optional)
            </label>
            <input
              type="number"
              step="any"
              id="longitude"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="-74.0060"
            />
          </div>
        </div>

        <div>
          <ImageUpload
            maxImages={5}
            maxSizeMB={5}
            onUpload={handleImageUpload}
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportIssue;

