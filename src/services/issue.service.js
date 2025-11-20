import api from './api';

export const issueService = {
  // Categories
  listCategories: () => api.get('/api/issues/categories'),
  createCategory: (data) => api.post('/api/admin/issue-categories', data),
  updateCategory: (categoryId, data) => api.patch(`/api/admin/issue-categories/${categoryId}`, data),
  deleteCategory: (categoryId) => api.delete(`/api/admin/issue-categories/${categoryId}`),
  
  // Authorities (for citizens to select when reporting issues)
  listAuthorities: () => {
    // Try the issues endpoint first, fallback to admin endpoint
    return api.get('/api/issues/authorities').catch(() => {
      // Fallback to admin endpoint (might work if backend allows it)
      return api.get('/api/admin/authorities');
    });
  },
  
  // Reports
  createReport: (formData) => {
    return api.post('/api/issues/reports', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  listReports: (params = {}) => {
    return api.get('/api/issues/reports', { params });
  },
  
  getReport: (reportId) => {
    return api.get(`/api/issues/reports/${reportId}`);
  },
  
  updateStatus: (reportId, data) =>
    api.patch(`/api/issues/reports/${reportId}/status`, data),
  
  flagReport: (reportId, flagId) =>
    api.post(`/api/issues/reports/${reportId}/flag`, { flagId }),
  
  deleteFlag: (flagId, reportId) => {
    // Try DELETE on the flag resource with report ID context
    return api.delete(`/api/issues/reports/${reportId}/flags/${flagId}`)
      .catch((err) => {
        // If nested endpoint doesn't work, try direct flag endpoint
        if (err.response?.status === 404 || err.response?.status === 405) {
          return api.delete(`/api/issues/reports/flags/${flagId}`)
            .catch((err2) => {
              // If that also fails, try admin endpoint
              return api.delete(`/api/admin/flags/${flagId}`)
                .catch((err3) => {
                  console.error('Failed to delete flag with all endpoints:', err3);
                  throw new Error(`The API endpoint for deleting flags was not found. Please ensure the backend supports DELETE /api/issues/reports/${reportId}/flags/${flagId} or DELETE /api/admin/flags/${flagId}`);
                });
            });
        }
        throw err;
      });
  },
  
  listFlaggedReports: () => api.get('/api/issues/reports/flagged'),
  
  hideReport: (reportId) => {
    // Try PATCH to update is_hidden field
    return api.patch(`/api/issues/reports/${reportId}`, { is_hidden: true })
      .catch((err) => {
        // If PATCH doesn't work, try a dedicated hide endpoint
        if (err.response?.status === 404 || err.response?.status === 405) {
          return api.post(`/api/issues/reports/${reportId}/hide`)
            .catch((err2) => {
              console.error('Failed to hide report with both endpoints:', err2);
              throw new Error(`The API endpoint for hiding reports was not found. Please ensure the backend supports PATCH /api/issues/reports/${reportId} with { is_hidden: true } or POST /api/issues/reports/${reportId}/hide`);
            });
        }
        throw err;
      });
  },
};

