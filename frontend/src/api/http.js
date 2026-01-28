
import { toast } from "sonner";

// Use relative paths so nginx proxy can handle routing
// This works in both development (with vite proxy) and production (with nginx proxy)
let API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';


if (!API_BASE_URL) {
  throw new Error("❌ VITE_API_BASE_URL is not defined");
}


console.log('Final API_BASE_URL:', API_BASE_URL);
console.log('Environment:', import.meta.env.MODE);

/**
 * Get authorization headers if token exists
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

/**
 * Handle API errors gracefully with toast notifications
 */
const handleApiError = (error, endpoint) => {
  console.error(`API Error [${endpoint}]:`, error);
  
  // Parse error message
  let errorMessage = 'An unexpected error occurred';
  let errorTitle = 'Error';
  
  if (error.message) {
    if (error.message.includes('401')) {
      errorTitle = 'Authentication Error';
      errorMessage = 'Your session has expired. Please login again.';
      // Clear auth data on 401
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    } else if (error.message.includes('403')) {
      errorTitle = 'Access Denied';
      errorMessage = 'You do not have permission to perform this action.';
    } else if (error.message.includes('404')) {
      errorTitle = 'Not Found';
      errorMessage = 'The requested resource was not found.';
    } else if (error.message.includes('500')) {
      errorTitle = 'Server Error';
      errorMessage = 'Something went wrong on our end. Please try again later.';
    } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      errorTitle = 'Connection Error';
      errorMessage = 'Unable to connect to the server. Please check your internet connection.';
    } else {
      errorMessage = error.message;
    }
  }
  
  // Show toast notification
  toast.error(errorMessage, {
    description: errorTitle !== 'Error' ? `${errorTitle}` : undefined,
    duration: 5000,
  });
  
  throw error;
};

/**
 * Parse response and handle error status codes
 */
const parseResponse = async (response, endpoint) => {
  const contentType = response.headers.get('content-type');
  
  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    
    // Try to get error message from response body
    if (contentType && contentType.includes('application/json')) {
      try {
        const errorData = await response.json();
        if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        // Ignore JSON parse errors
      }
    }
    
    throw new Error(errorMessage);
  }
  
  // Handle empty responses
  if (response.status === 204 || !contentType) {
    return null;
  }
  
  if (contentType.includes('application/json')) {
    return response.json();
  }
  
  return response.text();
};

/**
 * Base HTTP client with common configuration and global error handling
 */
export const http = {
  async get(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
          ...options.headers,
        },
        ...options,
      });
      
      return await parseResponse(response, endpoint);
    } catch (error) {
      return handleApiError(error, endpoint);
    }
  },

  async post(endpoint, data, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
          ...options.headers,
        },
        body: JSON.stringify(data),
        ...options,
      });
      
      return await parseResponse(response, endpoint);
    } catch (error) {
      return handleApiError(error, endpoint);
    }
  },

  async put(endpoint, data, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
          ...options.headers,
        },
        body: JSON.stringify(data),
        ...options,
      });
      
      return await parseResponse(response, endpoint);
    } catch (error) {
      return handleApiError(error, endpoint);
    }
  },

  async delete(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
          ...options.headers,
        },
        ...options,
      });
      
      return await parseResponse(response, endpoint);
    } catch (error) {
      return handleApiError(error, endpoint);
    }
  },
};

export default http;
