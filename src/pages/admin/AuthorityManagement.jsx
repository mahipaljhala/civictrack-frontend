import { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { issueService } from '../../services/issue.service';
import { handleApiError } from '../../utils/errorHandler';

const AuthorityManagement = () => {
  const [authorities, setAuthorities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showIssuesModal, setShowIssuesModal] = useState(false);
  const [editingAuth, setEditingAuth] = useState(null);
  const [selectedIssueIds, setSelectedIssueIds] = useState([]);
  const [savingIssues, setSavingIssues] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    region: '',
    departmentId: '',
    address: '',
  });

  useEffect(() => {
    loadAuthorities();
    loadDepartments();
    loadCategories();
  }, []);

  const loadAuthorities = async () => {
    try {
      setLoading(true);
      const response = await adminService.listAuthorities();
      setAuthorities(response.data.data.authorities || []);
    } catch (err) {
      console.error('Failed to load authorities:', handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await adminService.listDepartments();
      setDepartments(response.data.data.departments || []);
    } catch (err) {
      console.error('Failed to load departments:', err);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await issueService.listCategories();
      setCategories(response.data?.data?.categories || 
                    response.data?.categories || 
                    response.data?.data || 
                    []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const handleCreate = () => {
    setEditingAuth(null);
    setFormData({ name: '', city: '', region: '', departmentId: '', address: '' });
    setShowModal(true);
  };

  const handleEdit = (auth) => {
    setEditingAuth(auth);
    setFormData({
      name: auth.name,
      city: auth.city,
      region: auth.region,
      departmentId: auth.department_id || '',
      address: auth.address || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate name
    if (!formData.name || !formData.name.trim()) {
      alert('Please enter an authority name.');
      return;
    }
    
    if (formData.name.trim().length < 2) {
      alert('Authority name must be at least 2 characters long.');
      return;
    }
    
    // Validate city
    if (!formData.city || !formData.city.trim()) {
      alert('Please enter the city where this authority is located.');
      return;
    }
    
    // Validate region
    if (!formData.region || !formData.region.trim()) {
      alert('Please enter the region where this authority is located.');
      return;
    }
    
    try {
      const data = {
        ...formData,
        departmentId: formData.departmentId ? parseInt(formData.departmentId) : undefined,
      };
      if (editingAuth) {
        await adminService.updateAuthority(editingAuth.id, data);
      } else {
        await adminService.createAuthority(data);
      }
      setShowModal(false);
      loadAuthorities();
    } catch (err) {
      alert(handleApiError(err));
    }
  };

  const handleDelete = async (authId) => {
    if (!window.confirm('Are you sure you want to delete this authority?')) {
      return;
    }
    try {
      await adminService.deleteAuthority(authId);
      loadAuthorities();
    } catch (err) {
      alert(handleApiError(err));
    }
  };

  const handleManageIssues = async (auth) => {
    setEditingAuth(auth);
    setSelectedIssueIds([]);
    setShowIssuesModal(true);
    
    // Load current issue categories assigned to this authority
    try {
      console.log('Loading issues for authority:', auth.id);
      const response = await adminService.getAuthorityIssues(auth.id);
      console.log('Authority issues response:', response);
      
      const currentIssues = response.data?.data?.issues || 
                           response.data?.data?.categories ||
                           response.data?.issues || 
                           response.data?.categories ||
                           response.data?.data || 
                           [];
      
      console.log('Current issues:', currentIssues);
      
      const issueIds = currentIssues.map(issue => 
        typeof issue === 'object' ? (issue.id || issue.issue_id || issue.category_id) : issue
      );
      setSelectedIssueIds(issueIds);
    } catch (err) {
      console.error('Failed to load authority issues:', err);
      console.error('Error response:', err.response);
      console.error('Error status:', err.response?.status);
      // If endpoint doesn't exist or fails, start with empty selection
      setSelectedIssueIds([]);
      // Don't show error to user - they can still select issues
    }
  };

  const handleIssueToggle = (issueId) => {
    setSelectedIssueIds(prev => {
      if (prev.includes(issueId)) {
        return prev.filter(id => id !== issueId);
      } else {
        return [...prev, issueId];
      }
    });
  };

  const handleSaveIssues = async () => {
    if (!editingAuth) return;
    
    try {
      setSavingIssues(true);
      const issueIds = selectedIssueIds.map(id => parseInt(id));
      console.log('Saving issues for authority:', editingAuth.id, 'with issueIds:', issueIds);
      
      const response = await adminService.updateAuthorityIssues(editingAuth.id, issueIds);
      console.log('Update response:', response);
      
      setShowIssuesModal(false);
      setEditingAuth(null);
      setSelectedIssueIds([]);
      // Reload authorities to refresh any issue count or display
      loadAuthorities();
      alert('Issue categories updated successfully!');
    } catch (err) {
      console.error('Failed to update authority issues:', err);
      console.error('Error response:', err.response);
      console.error('Error status:', err.response?.status);
      console.error('Error data:', err.response?.data);
      
      const errorMsg = handleApiError(err);
      
      // Provide more helpful error message
      if (err.response?.status === 404) {
        alert('The API endpoint for managing authority-issue mappings was not found. Please check if the backend endpoint is implemented.\n\n' + 
              'Expected endpoint: PATCH /api/admin/authorities/:id/issues\n\n' + 
              'Error: ' + errorMsg);
      } else {
        alert('Failed to update issue categories: ' + errorMsg);
      }
    } finally {
      setSavingIssues(false);
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
        <h1 className="text-3xl font-bold text-gray-900">Authority Management</h1>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Create Authority
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {authorities.map((auth) => (
            <li key={auth.id} className="px-6 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{auth.name}</h3>
                  <p className="text-sm text-gray-500">
                    {auth.city}, {auth.region}
                  </p>
                  {auth.department && (
                    <p className="text-sm text-gray-500">Dept: {auth.department.name}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleManageIssues(auth)}
                    className="text-green-600 hover:text-green-800 font-medium"
                    title="Manage issue categories for this authority"
                  >
                    Manage Issues
                  </button>
                  <button
                    onClick={() => handleEdit(auth)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(auth.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {showIssuesModal && editingAuth && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              Manage Issue Categories - {editingAuth.name}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Select which issue categories this authority handles. Issues will be automatically assigned to this authority if the category, city, and region match.
            </p>
            
            {categories.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No issue categories available. Please create categories first.
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                {categories.map((category) => (
                  <label
                    key={category.id}
                    className="flex items-center p-3 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIssueIds.includes(category.id)}
                      onChange={() => handleIssueToggle(category.id)}
                      className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">{category.name}</span>
                      {category.description && (
                        <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <button
                type="button"
                onClick={() => {
                  setShowIssuesModal(false);
                  setEditingAuth(null);
                  setSelectedIssueIds([]);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={savingIssues}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveIssues}
                disabled={savingIssues}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {savingIssues ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">
              {editingAuth ? 'Edit Authority' : 'Create Authority'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Region <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <select
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select a department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={2}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingAuth ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorityManagement;

