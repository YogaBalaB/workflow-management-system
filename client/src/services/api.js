const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Custom request wrapper for API calls
 */
const request = async (method, endpoint, body = null, params = {}) => {
  // 1. Build URL with query params
  let url = `${BASE_URL}${endpoint}`;
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      queryParams.append(key, val);
    }
  });
  
  if (queryParams.toString()) {
    url += `?${queryParams.toString()}`;
  }

  // 2. Setup headers
  const headers = {
    'Content-Type': 'application/json'
  };

  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // 3. Configure request options
  const options = {
    method,
    headers
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  // 4. Perform fetch
  try {
    const res = await fetch(url, options);
    
    // Parse JSON safely
    let data = {};
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await res.json();
    }

    if (!res.ok) {
      const errorMsg = data.message || `API Error: Status ${res.status}`;
      const err = new Error(errorMsg);
      err.status = res.status;
      err.errors = data.errors || null;
      throw err;
    }

    // Standard API returns { success: true, message: "...", data: {...} }
    return data.data !== undefined ? data.data : data;
  } catch (error) {
    console.error(`🚨 API Request [${method}] ${endpoint} failed:`, error);
    throw error;
  }
};

export const api = {
  get: (endpoint, params) => request('GET', endpoint, null, params),
  post: (endpoint, body) => request('POST', endpoint, body),
  put: (endpoint, body) => request('PUT', endpoint, body),
  patch: (endpoint, body) => request('PATCH', endpoint, body),
  delete: (endpoint) => request('DELETE', endpoint)
};
