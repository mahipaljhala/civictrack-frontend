import { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { handleApiError } from '../../utils/errorHandler';

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const response = await adminService.listDepartments();
      setDepartments(response.data.data.departments || []);
    } catch (err) {
      console.error('Failed to load departments:', handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingDept(null);
    setFormData({ name: '', description: '' });
    setShowModal(true);
  };

  const handleEdit = (dept) => {
    setEditingDept(dept);
    setFormData({ name: dept.name, description: dept.description || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate name
    if (!formData.name || !formData.name.trim()) {
      alert('Please enter a department name.');
      return;
    }
    
    if (formData.name.trim().length < 2) {
      alert('Department name must be at least 2 characters long.');
      return;
    }
    
    if (formData.description && formData.description.length > 500) {
      alert('Description is too long. Please use 500 characters or less.');
      return;
    }
    
    try {
      if (editingDept) {
        await adminService.updateDepartment(editingDept.id, formData);
      } else {
        await adminService.createDepartment(formData);
      }
      setShowModal(false);
      loadDepartments();
    } catch (err) {
      alert(handleApiError(err));
    }
  };

  const handleDelete = async (deptId) => {
    if (!window.confirm('Are you sure you want to delete this department?')) {
      return;
    }
    try {
      await adminService.deleteDepartment(deptId);
      loadDepartments();
    } catch (err) {
      alert(handleApiError(err));
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
        <h1 className="text-3xl font-bold text-gray-900">Department Management</h1>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Create Department
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {departments.map((dept) => (
            <li key={dept.id} className="px-6 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{dept.name}</h3>
                  {dept.description && (
                    <p className="text-sm text-gray-500">{dept.description}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(dept)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(dept.id)}
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

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">
              {editingDept ? 'Edit Department' : 'Create Department'}
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
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
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
                  {editingDept ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentManagement;

