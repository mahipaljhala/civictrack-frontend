import { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { handleApiError } from '../../utils/errorHandler';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [authorities, setAuthorities] = useState([]);
  const [authorityUsers, setAuthorityUsers] = useState([]); // Store authority-user mappings
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    roleIds: [],
    authorityId: '',
  });

  // Available roles - these should match your database
  const ROLES = [
    { id: 1, name: 'admin' },
    { id: 2, name: 'authority' },
    { id: 3, name: 'citizen' },
  ];

  useEffect(() => {
    loadAvailableRoles();
    loadUsers();
    loadAuthorities();
    loadAuthorityUsers();
  }, []);

  const loadAuthorities = async () => {
    try {
      const response = await adminService.listAuthorities();
      setAuthorities(response.data?.data?.authorities || []);
    } catch (err) {
      console.error('Failed to load authorities:', err);
    }
  };

  const loadAuthorityUsers = async () => {
    try {
      const response = await adminService.listAuthorityUsers();
      setAuthorityUsers(response.data?.data?.authorityUsers || 
                        response.data?.authorityUsers || 
                        response.data?.data || 
                        []);
    } catch (err) {
      console.error('Failed to load authority users:', err);
    }
  };

  const loadAvailableRoles = async () => {
    try {
      // Try to fetch roles from API if endpoint exists
      try {
        const response = await adminService.listRoles?.();
        const rolesData = response.data?.data?.roles || 
                         response.data?.roles || 
                         response.data?.data || 
                         [];
        if (rolesData.length > 0) {
          setAvailableRoles(rolesData);
        } else {
          setAvailableRoles(ROLES);
        }
      } catch (err) {
        console.log('Roles endpoint not available, using default roles');
        // Use default roles if endpoint doesn't exist
        setAvailableRoles(ROLES);
      }
    } catch (err) {
      console.error('Failed to load roles:', err);
      setAvailableRoles(ROLES);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.listUsers();
      const usersData = response.data.data.users || [];
      setUsers(usersData);
      
      // Extract available roles from users if we haven't loaded them yet
      setAvailableRoles((currentRoles) => {
        if (currentRoles.length > 0) {
          return currentRoles; // Already loaded
        }
        
        if (usersData.length > 0) {
          const allRoles = new Map();
          usersData.forEach((user) => {
            if (user.roles && Array.isArray(user.roles)) {
              user.roles.forEach((role) => {
                if (!allRoles.has(role.id)) {
                  allRoles.set(role.id, role);
                }
              });
            }
          });
          
          // If we found roles from users, use them; otherwise use defaults
          if (allRoles.size > 0) {
            return Array.from(allRoles.values());
          }
        }
        
        return currentRoles.length > 0 ? currentRoles : ROLES;
      });
    } catch (err) {
      console.error('Failed to load users:', handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', password: '', roleIds: [], authorityId: '' });
    setShowModal(true);
  };

  const handleEdit = async (user) => {
    setEditingUser(user);
    
    // Load current authority-user link if user has authority role
    let currentAuthorityId = '';
    if (user.roles?.some(r => r.name === 'authority')) {
      const authUserLink = authorityUsers.find(au => au.user?.id === user.id || au.user_id === user.id);
      if (authUserLink) {
        currentAuthorityId = authUserLink.authority?.id || authUserLink.authority_id || '';
      }
    }
    
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      roleIds: user.roles?.map((r) => r.id) || [],
      authorityId: currentAuthorityId,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
          // Validate that at least one role is selected
          if (!formData.roleIds || formData.roleIds.length === 0) {
            alert('Please select at least one role for this user. Users must have at least one role assigned.');
            return;
          }
          
          // Validate name
          if (!formData.name || formData.name.trim().length < 2) {
            alert('Please enter a valid name (at least 2 characters).');
            return;
          }
          
          // Validate email
          if (!formData.email || !formData.email.trim()) {
            alert('Please enter a valid email address.');
            return;
          }
          
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(formData.email)) {
            alert('Please enter a valid email address (e.g., name@example.com).');
            return;
          }
          
          // Validate password for new users
          if (!editingUser && (!formData.password || formData.password.length < 8)) {
            alert('Password must be at least 8 characters long for security.');
            return;
          }
    
    try {
      if (editingUser) {
        console.log('Updating user:', editingUser.id);
        console.log('User data:', { name: formData.name, email: formData.email });
        console.log('Role IDs:', formData.roleIds);
        
        // Update user info
        try {
          await adminService.updateUser(editingUser.id, {
            name: formData.name,
            email: formData.email,
          });
          console.log('User info updated successfully');
        } catch (userErr) {
          console.error('Failed to update user info:', userErr);
          console.error('User update error:', userErr.response?.data);
          throw userErr;
        }
        
        // Update roles
        try {
          console.log('Updating user roles with roleIds:', formData.roleIds);
          await adminService.updateUserRoles(editingUser.id, formData.roleIds);
          console.log('User roles updated successfully');
        } catch (roleErr) {
          console.error('Failed to update user roles:', roleErr);
          console.error('Role update error:', roleErr.response?.data);
          console.error('Role update error response:', roleErr.response);
          throw roleErr;
        }

        // Handle authority-user linking if user has authority role
        const hasAuthorityRole = formData.roleIds.some(roleId => {
          const role = availableRoles.find(r => r.id === roleId);
          return role?.name === 'authority';
        });

        if (hasAuthorityRole && formData.authorityId) {
          try {
            // Check if authority-user link already exists
            const existingLink = authorityUsers.find(au => au.user?.id === editingUser.id || au.user_id === editingUser.id);
            
            if (existingLink) {
              // Update existing link
              await adminService.updateAuthorityUser(existingLink.id, {
                authorityId: parseInt(formData.authorityId),
              });
              console.log('Authority-user link updated successfully');
            } else {
              // Create new link
              await adminService.createAuthorityUser({
                userId: editingUser.id,
                authorityId: parseInt(formData.authorityId),
              });
              console.log('Authority-user link created successfully');
            }
          } catch (authErr) {
            console.error('Failed to update authority-user link:', authErr);
            // Don't throw - role update was successful, this is secondary
          }
        } else if (hasAuthorityRole && !formData.authorityId) {
          // Remove authority-user link if authority role is selected but no authority chosen
          const existingLink = authorityUsers.find(au => au.user?.id === editingUser.id || au.user_id === editingUser.id);
          if (existingLink) {
            try {
              await adminService.deleteAuthorityUser(existingLink.id);
              console.log('Authority-user link removed');
            } catch (authErr) {
              console.error('Failed to remove authority-user link:', authErr);
            }
          }
        } else if (!hasAuthorityRole) {
          // Remove authority-user link if user no longer has authority role
          const existingLink = authorityUsers.find(au => au.user?.id === editingUser.id || au.user_id === editingUser.id);
          if (existingLink) {
            try {
              await adminService.deleteAuthorityUser(existingLink.id);
              console.log('Authority-user link removed (user no longer has authority role)');
            } catch (authErr) {
              console.error('Failed to remove authority-user link:', authErr);
            }
          }
        }
      } else {
        console.log('Creating new user:', formData);
        const userData = { ...formData };
        const authorityIdToLink = userData.authorityId;
        delete userData.authorityId; // Don't send authorityId when creating user
        
        const response = await adminService.createUser(userData);
        const createdUser = response.data?.data?.user || response.data?.user;
        
        // After creating user, link to authority if authority role is selected
        const hasAuthorityRole = formData.roleIds.some(roleId => {
          const role = availableRoles.find(r => r.id === roleId);
          return role?.name === 'authority';
        });
        
        if (hasAuthorityRole && authorityIdToLink && createdUser?.id) {
          try {
            await adminService.createAuthorityUser({
              userId: createdUser.id,
              authorityId: parseInt(authorityIdToLink),
            });
            console.log('Authority-user link created successfully');
          } catch (authErr) {
            console.error('Failed to link user to authority:', authErr);
            // Don't throw - user was created successfully
          }
        }
      }
      setShowModal(false);
      await loadUsers();
      await loadAuthorityUsers(); // Reload authority-user mappings
    } catch (err) {
      console.error('Failed to save user:', err);
      console.error('Error response:', err.response);
      console.error('Error data:', err.response?.data);
      
      let errorMessage = 'Failed to save user';
      if (err.response?.data) {
        const errorData = err.response.data;
        // Try to extract detailed error messages
        if (errorData.errors && Array.isArray(errorData.errors)) {
          errorMessage = errorData.errors.join('\n');
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else {
          errorMessage = handleApiError(err);
        }
      } else {
        errorMessage = handleApiError(err);
      }
      
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleRoleChange = (roleId) => {
    const roleIdNum = parseInt(roleId);
    setFormData((prev) => {
      if (prev.roleIds.includes(roleIdNum)) {
        return {
          ...prev,
          roleIds: prev.roleIds.filter((id) => id !== roleIdNum),
        };
      } else {
        return {
          ...prev,
          roleIds: [...prev.roleIds, roleIdNum],
        };
      }
    });
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }
    try {
      await adminService.deleteUser(userId);
      loadUsers();
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
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Create User
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {users.map((user) => (
            <li key={user.id} className="px-6 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <div className="mt-1">
                    {user.roles?.map((role) => (
                      <span
                        key={role.id}
                        className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded mr-1"
                      >
                        {role.name}
                      </span>
                    ))}
                  </div>
                  {user.roles?.some(r => r.name === 'authority') && (
                    <div className="mt-2">
                      {(() => {
                        const authUserLink = authorityUsers.find(au => au.user?.id === user.id || au.user_id === user.id);
                        return authUserLink ? (
                          <span className="text-xs text-blue-600">
                            Authority: {authUserLink.authority?.name || 'Unknown'}
                            {authUserLink.authority?.city && authUserLink.authority?.region && (
                              <span className="text-gray-500">
                                {' '}({authUserLink.authority.city}, {authUserLink.authority.region})
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-xs text-amber-600">Not linked to any authority</span>
                        );
                      })()}
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(user)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
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
              {editingUser ? 'Edit User' : 'Create User'}
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
                  Email <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Roles <span className="text-red-600">*</span>
                </label>
                <div className="space-y-2">
                  {availableRoles.map((role) => (
                    <label key={role.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.roleIds.includes(role.id)}
                        onChange={() => handleRoleChange(role.id)}
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700 capitalize">
                        {role.name} {role.description ? `- ${role.description}` : ''}
                      </span>
                    </label>
                  ))}
                </div>
                {formData.roleIds.length === 0 && (
                  <p className="mt-1 text-sm text-amber-600">
                    User must have at least one role
                  </p>
                )}
              </div>
              
              {/* Show authority selector only when authority role is selected */}
              {formData.roleIds.some(roleId => {
                const role = availableRoles.find(r => r.id === roleId);
                return role?.name === 'authority';
              }) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Authority
                  </label>
                  <select
                    value={formData.authorityId}
                    onChange={(e) => setFormData({ ...formData, authorityId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select an authority (optional)</option>
                    {authorities.map((auth) => (
                      <option key={auth.id} value={auth.id}>
                        {auth.name} - {auth.city}, {auth.region}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Select which authority this user belongs to. This will link the user to the authority for issue assignments.
                  </p>
                </div>
              )}
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
                  {editingUser ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;

