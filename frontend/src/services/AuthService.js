import axios from 'axios';

function getCookie(name) {
  const value = document.cookie;
  if (!value) return null;
  const parts = value.split(`${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

const api = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});
api.interceptors.request.use(config => {
  const csrfToken = getCookie('csrftoken');
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  return config;
}, error => {
  return Promise.reject(error);
});


export const AuthService = {
    login: async(token) => {
        try{
            const response = await api.post("/api/auth/google_login/", { token
            })
            return response.data
        } catch (error) {
            console.error("Error logging in", error)
            throw error
        }
    },
    logout: async() => {
        try{
            const response = await api.post("/api/auth/google_logout/")
            return response.data
        }catch (error) {
            console.error("Error logging in", error)
            throw error
        }
    },
    checksession: async() => {
    try {
        const response = await api.get('/api/auth/check_session/');
        return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      return { user: null };
    }
    console.error('Session check failed:', error.response?.data || error.message);
    throw error;
  }
    }
}