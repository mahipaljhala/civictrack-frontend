/**
 * Maps backend field names to user-friendly field labels
 */
const FIELD_LABELS = {
  name: 'Name',
  email: 'Email address',
  password: 'Password',
  title: 'Title',
  description: 'Description',
  issueId: 'Category',
  categoryId: 'Category',
  authorityId: 'Authority',
  latitude: 'Latitude',
  longitude: 'Longitude',
  city: 'City',
  region: 'Region',
  slug: 'Slug',
  departmentId: 'Department',
  authority_id: 'Authority',
  userId: 'User',
  roleIds: 'Roles',
  role_id: 'Role',
};

/**
 * Transforms backend error messages to user-friendly messages
 */
const transformErrorMessage = (message) => {
  if (!message) return 'Please check your input and try again.';
  
  const lowerMessage = message.toLowerCase();
  
  // Email validation
  if (lowerMessage.includes('email') || lowerMessage.includes('invalid email')) {
    if (lowerMessage.includes('already') || lowerMessage.includes('exists') || lowerMessage.includes('taken')) {
      return 'This email address is already registered. Please use a different email or sign in.';
    }
    if (lowerMessage.includes('invalid') || lowerMessage.includes('format')) {
      return 'Please enter a valid email address (e.g., name@example.com).';
    }
    if (lowerMessage.includes('required')) {
      return 'Email address is required.';
    }
  }
  
  // Password validation
  if (lowerMessage.includes('password')) {
    if (lowerMessage.includes('length') || lowerMessage.includes('short') || lowerMessage.includes('minimum')) {
      return 'Password must be at least 8 characters long.';
    }
    if (lowerMessage.includes('match') || lowerMessage.includes('does not match')) {
      return 'Passwords do not match. Please try again.';
    }
    if (lowerMessage.includes('required')) {
      return 'Password is required.';
    }
    if (lowerMessage.includes('incorrect') || lowerMessage.includes('wrong') || lowerMessage.includes('invalid')) {
      return 'Incorrect password. Please try again or reset your password.';
    }
  }
  
  // Name validation
  if (lowerMessage.includes('name')) {
    if (lowerMessage.includes('required')) {
      return 'Name is required.';
    }
    if (lowerMessage.includes('length') || lowerMessage.includes('short')) {
      return 'Name must be at least 2 characters long.';
    }
  }
  
  // Title/Description validation
  if (lowerMessage.includes('title')) {
    if (lowerMessage.includes('required')) {
      return 'Title is required. Please provide a brief description of the issue.';
    }
    if (lowerMessage.includes('length') || lowerMessage.includes('short')) {
      return 'Title must be at least 5 characters long.';
    }
  }
  
  if (lowerMessage.includes('description')) {
    if (lowerMessage.includes('required')) {
      return 'Description is required. Please provide details about the issue.';
    }
    if (lowerMessage.includes('length') || lowerMessage.includes('short')) {
      return 'Description must be at least 10 characters long.';
    }
  }
  
  // Category/Issue validation
  if (lowerMessage.includes('category') || lowerMessage.includes('issue')) {
    if (lowerMessage.includes('required') || lowerMessage.includes('select')) {
      return 'Please select a category for this issue.';
    }
  }
  
  // General required field
  if (lowerMessage.includes('required') || lowerMessage.includes('cannot be empty')) {
    return 'This field is required.';
  }
  
  // Length validation
  if (lowerMessage.includes('too long') || lowerMessage.includes('maximum')) {
    return 'This field is too long. Please shorten it.';
  }
  
  if (lowerMessage.includes('too short') || lowerMessage.includes('minimum')) {
    return 'This field is too short. Please provide more information.';
  }
  
  // Duplicate/Exists
  if (lowerMessage.includes('already exists') || lowerMessage.includes('duplicate') || lowerMessage.includes('taken')) {
    return 'This information already exists. Please use a different value.';
  }
  
  // Authentication
  if (lowerMessage.includes('unauthorized') || lowerMessage.includes('not authenticated')) {
    return 'Please sign in to continue.';
  }
  
  if (lowerMessage.includes('invalid credentials') || lowerMessage.includes('login failed')) {
    return 'Invalid email or password. Please check your credentials and try again.';
  }
  
  // Permission
  if (lowerMessage.includes('permission') || lowerMessage.includes('forbidden') || lowerMessage.includes('not allowed')) {
    return 'You do not have permission to perform this action.';
  }
  
  // Not found
  if (lowerMessage.includes('not found')) {
    return 'The requested information could not be found.';
  }
  
  // Return original message if no transformation found, but capitalize first letter
  return message.charAt(0).toUpperCase() + message.slice(1);
};

/**
 * Formats field-specific errors with user-friendly labels
 */
const formatFieldError = (field, message) => {
  const fieldLabel = FIELD_LABELS[field] || field;
  const transformedMessage = transformErrorMessage(message);
  
  // If message already mentions the field, return as is
  if (transformedMessage.toLowerCase().includes(fieldLabel.toLowerCase())) {
    return transformedMessage;
  }
  
  return `${fieldLabel}: ${transformedMessage}`;
};

/**
 * Handles API errors and returns user-friendly error messages
 */
export const handleApiError = (error) => {
  if (!error) {
    return 'An unexpected error occurred. Please try again.';
  }
  
  if (error.response) {
    // Server responded with error
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        // Bad Request - usually validation errors
        if (data.errors && Array.isArray(data.errors)) {
          return data.errors.map(err => transformErrorMessage(err)).join('. ');
        }
        if (data.message) {
          return transformErrorMessage(data.message);
        }
        return 'Invalid request. Please check your input and try again.';
        
      case 401:
        // Unauthorized - redirect to login
        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && currentPath !== '/register') {
          window.location.href = '/login';
        }
        return 'Your session has expired. Please sign in again.';
        
      case 403:
        return 'You do not have permission to perform this action. Contact an administrator if you believe this is an error.';
        
      case 404:
        return 'The requested information could not be found.';
        
      case 409:
        // Conflict - usually duplicate data
        if (data.message) {
          return transformErrorMessage(data.message);
        }
        return 'This information already exists. Please use a different value.';
        
      case 422:
        // Unprocessable Entity - validation errors
        if (data.errors) {
          if (Array.isArray(data.errors)) {
            return data.errors.map(err => {
              // Handle field-specific errors: { field: "message" } or just string
              if (typeof err === 'object' && err !== null) {
                return Object.entries(err)
                  .map(([field, message]) => formatFieldError(field, message))
                  .join('. ');
              }
              return transformErrorMessage(err);
            }).filter(Boolean).join('. ');
          }
          
          // Handle object with field names as keys
          if (typeof data.errors === 'object') {
            return Object.entries(data.errors)
              .map(([field, message]) => formatFieldError(field, message))
              .filter(Boolean)
              .join('. ');
          }
        }
        
        if (data.message) {
          return transformErrorMessage(data.message);
        }
        return 'Please check your input and correct any errors.';
        
      case 500:
      case 502:
      case 503:
        return 'Our servers are experiencing issues. Please try again in a few moments.';
        
      default:
        if (data?.message) {
          return transformErrorMessage(data.message);
        }
        return 'Something went wrong. Please try again or contact support if the problem persists.';
    }
  }
  
  // Network errors
  if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
    return 'Unable to connect to the server. Please check your internet connection and try again.';
  }
  
  if (error.message) {
    return transformErrorMessage(error.message);
  }
  
  return 'An unexpected error occurred. Please try again.';
};

