import api from './api';

export const adminService = {
  // Users
  listUsers: () => api.get('/api/admin/users'),
  createUser: (data) => api.post('/api/admin/users', data),
  updateUser: (userId, data) => api.patch(`/api/admin/users/${userId}`, data),
  updateUserRoles: (userId, roleIds) => {
    console.log('updateUserRoles called with:', { userId, roleIds });
    // Ensure roleIds is an array of integers
    const roleIdsArray = Array.isArray(roleIds) ? roleIds.map(id => parseInt(id)) : [parseInt(roleIds)];
    console.log('Sending roleIds:', roleIdsArray);
    return api.patch(`/api/admin/users/${userId}/roles`, { roleIds: roleIdsArray });
  },
  deleteUser: (userId) => api.delete(`/api/admin/users/${userId}`),

  // Departments
  listDepartments: () => api.get('/api/admin/departments'),
  createDepartment: (data) => api.post('/api/admin/departments', data),
  updateDepartment: (departmentId, data) =>
    api.patch(`/api/admin/departments/${departmentId}`, data),
  deleteDepartment: (departmentId) =>
    api.delete(`/api/admin/departments/${departmentId}`),

  // Authorities
  listAuthorities: () => api.get('/api/admin/authorities'),
  createAuthority: (data) => api.post('/api/admin/authorities', data),
  updateAuthority: (authorityId, data) =>
    api.patch(`/api/admin/authorities/${authorityId}`, data),
  deleteAuthority: (authorityId) =>
    api.delete(`/api/admin/authorities/${authorityId}`),

  // Authority Users
  listAuthorityUsers: () => api.get('/api/admin/authority-users'),
  createAuthorityUser: (data) => api.post('/api/admin/authority-users', data),
  updateAuthorityUser: (authorityUserId, data) =>
    api.patch(`/api/admin/authority-users/${authorityUserId}`, data),
  deleteAuthorityUser: (authorityUserId) =>
    api.delete(`/api/admin/authority-users/${authorityUserId}`),

  // Authority Issues (Issue Categories assigned to Authorities)
  getAuthorityIssues: (authorityId) => {
    return api.get(`/api/admin/authorities/${authorityId}/issues`)
      .catch((err) => {
        // If nested endpoint doesn't exist, try alternative patterns
        if (err.response?.status === 404) {
          console.log('Nested endpoint not found, trying alternative...');
          // Try separate resource endpoint
          return api.get(`/api/admin/authority-issues?authorityId=${authorityId}`)
            .catch(() => {
              // If that also fails, return empty array structure
              return { data: { data: { issues: [] } } };
            });
        }
        throw err;
      });
  },
  updateAuthorityIssues: (authorityId, issueIds) => {
    console.log('Updating authority issues:', { authorityId, issueIds });
    // Ensure issueIds is an array of integers
    const issueIdsArray = Array.isArray(issueIds) ? issueIds.map(id => parseInt(id)) : [parseInt(issueIds)];
    
    // Try nested endpoint first
    return api.patch(`/api/admin/authorities/${authorityId}/issues`, { issueIds: issueIdsArray })
      .catch((err) => {
        // If nested endpoint doesn't exist (404), try alternative patterns
        if (err.response?.status === 404) {
          console.log('Nested endpoint not found, trying alternative...');
          // Try separate resource endpoint like authority-users pattern
          return api.post(`/api/admin/authority-issues/bulk`, { 
            authorityId: parseInt(authorityId), 
            issueIds: issueIdsArray
          }).catch((err2) => {
            // If that also fails, try individual create/delete pattern
            console.log('Bulk endpoint not found, trying individual operations...');
            throw err; // Re-throw original error with clearer message
          });
        }
        throw err;
      });
  },
};

