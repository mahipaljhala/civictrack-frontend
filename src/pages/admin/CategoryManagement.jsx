import { useState, useEffect } from 'react';
import { issueService } from '../../services/issue.service';
import { handleApiError } from '../../utils/errorHandler';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', slug: '', description: '' });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await issueService.listCategories();
      const categoriesData = response.data?.data?.categories || 
                            response.data?.categories || 
                            response.data?.data || 
                            [];
      setCategories(categoriesData);
    } catch (err) {
      console.error('Failed to load categories:', err);
      alert('Failed to load categories: ' + handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setFormData({ name: '', slug: '', description: '' });
    setShowModal(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({ 
      name: category.name || '', 
      slug: category.slug || '', 
      description: category.description || '' 
    });
    setShowModal(true);
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (name) => {
    // Auto-generate slug when name changes (only if slug is empty or was auto-generated)
    const newSlug = name.trim() ? generateSlug(name) : '';
    setFormData(prev => ({
      ...prev,
      name,
      // Only auto-generate slug if it's empty or matches the old auto-generated slug
      slug: prev.slug === '' || prev.slug === generateSlug(prev.name) ? newSlug : prev.slug
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Generate slug if not provided
      const dataToSend = {
        ...formData,
        slug: formData.slug.trim() || generateSlug(formData.name)
      };
      
      // Validate required fields
      if (!dataToSend.name || !dataToSend.name.trim()) {
        alert('Please enter a category name.');
        return;
      }
      
      if (dataToSend.name.trim().length < 2) {
        alert('Category name must be at least 2 characters long.');
        return;
      }
      
      if (dataToSend.name.trim().length > 100) {
        alert('Category name is too long. Please use 100 characters or less.');
        return;
      }
      
      if (dataToSend.description && dataToSend.description.length > 500) {
        alert('Description is too long. Please use 500 characters or less.');
        return;
      }
      
      console.log('Submitting category:', dataToSend);
      
      if (editingCategory) {
        console.log('Updating category:', editingCategory.id);
        const response = await issueService.updateCategory(editingCategory.id, dataToSend);
        console.log('Update response:', response);
      } else {
        console.log('Creating new category');
        const response = await issueService.createCategory(dataToSend);
        console.log('Create response:', response);
      }
      
      setShowModal(false);
      setFormData({ name: '', slug: '', description: '' });
      loadCategories();
    } catch (err) {
      console.error('Failed to save category:', err);
      console.error('Error response:', err.response);
      console.error('Error data:', err.response?.data);
      const errorMessage = handleApiError(err);
      alert('Failed to save category: ' + errorMessage);
    }
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }
    try {
      await issueService.deleteCategory(categoryId);
      loadCategories();
    } catch (err) {
      alert('Failed to delete category: ' + handleApiError(err));
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading categories...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Issue Category Management</h1>
          <p className="text-gray-600 mt-2">
            Manage issue categories that users can select when reporting issues
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          Create Category
        </button>
      </div>

      {categories.length === 0 ? (
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
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
          <p className="text-gray-500 mb-4">
            Get started by creating your first issue category.
          </p>
          <button
            onClick={handleCreate}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Create Category
          </button>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {categories.map((category) => (
              <li key={category.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
                    {category.slug && (
                      <p className="text-sm text-gray-500 mt-1">
                        Slug: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{category.slug}</code>
                      </p>
                    )}
                    {category.description && (
                      <p className="text-sm text-gray-600 mt-2">{category.description}</p>
                    )}
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(category)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">
              {editingCategory ? 'Edit Category' : 'Create Category'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Pothole"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => {
                    const newSlug = e.target.value;
                    setFormData(prev => ({ ...prev, slug: newSlug }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Auto-generated from name"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL-friendly identifier (auto-generated from name when you type)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Brief description of this category"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;

