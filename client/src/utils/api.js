import axios from 'axios';

// Create axios instance with default config
export const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
    xsrfCookieName: 'csrftoken',
    xsrfHeaderName: 'X-CSRFToken'
});

// Function to get CSRF token from cookies
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Add request interceptor to include auth token and CSRF token
api.interceptors.request.use(
    (config) => {
        // Add auth token
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Token ${token}`;
        }

        // Add CSRF token
        const csrfToken = getCookie('csrftoken');
        if (csrfToken) {
            config.headers['X-CSRFToken'] = csrfToken;
        }

        // For multipart/form-data, let the browser set the Content-Type and boundary
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data);
        
        if (error.response) {
            const status = error.response.status;
            const errorMessage = error.response.data?.error || error.response.data?.detail || 'An error occurred';
            
            // Handle authentication errors (401 or 403)
            if (status === 401 || status === 403) {
                // Clear auth data
                localStorage.removeItem('token');
                localStorage.removeItem('userRole');
                
                // Only redirect if not already on a login page
                if (!window.location.pathname.includes('login')) {
                    // Determine the appropriate login page based on stored role
                    const userRole = localStorage.getItem('userRole');
                    window.location.href = userRole === 'admin' ? '/login-admin' : '/login-faculty';
                }
            }
        }
        return Promise.reject(error);
    }
); 