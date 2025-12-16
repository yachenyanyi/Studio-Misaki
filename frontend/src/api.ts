import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';

const normalizeBase = (base: string) => base.replace(/\/+$/, '');
const normalizePath = (path: string) => (path.startsWith('/') ? path : `/${path}`);

const apiUrl = new URL(API_BASE_URL, window.location.origin);
const BACKEND_ORIGIN = import.meta.env.VITE_BACKEND_ORIGIN || apiUrl.origin;
const STATIC_PREFIX = '/static';
const MEDIA_PREFIX = '/media';

const STATIC_BASE_URL = normalizeBase(import.meta.env.VITE_STATIC_BASE || window.location.origin);
const MEDIA_BASE_URL = normalizeBase(import.meta.env.VITE_MEDIA_BASE || BACKEND_ORIGIN);

console.log(`[API Config] Using API Base: ${API_BASE_URL} (Mode: ${import.meta.env.MODE})`);

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for Session Auth
  // Remove default Content-Type to allow Axios/Browser to set it correctly
  // (e.g. multipart/form-data with boundary for file uploads)
});

// 导出这个 URL 供其他组件使用（如 ChatWindowUseStream）
export { 
  API_BASE_URL,
  BACKEND_ORIGIN,
  STATIC_BASE_URL,
  MEDIA_BASE_URL,
  STATIC_PREFIX,
  MEDIA_PREFIX,
};

export const resolveBackendPath = (pathOrUrl: string) => {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  if (pathOrUrl.startsWith(STATIC_PREFIX + '/')) return `${STATIC_BASE_URL}${pathOrUrl}`;
  if (pathOrUrl.startsWith(MEDIA_PREFIX + '/')) return `${MEDIA_BASE_URL}${pathOrUrl}`;
  if (pathOrUrl.startsWith('/')) return `${normalizeBase(BACKEND_ORIGIN)}${pathOrUrl}`;
  return pathOrUrl;
};

export const buildDjangoStaticUrl = (relativePath: string) => {
  return `${STATIC_BASE_URL}${STATIC_PREFIX}${normalizePath(relativePath)}`;
};

export const buildStaticUrl = buildDjangoStaticUrl;

// CSRF Token handling for Django
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  const getCookie = (name: string) => {
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
  };
  
  const csrftoken = getCookie('csrftoken');
  if (csrftoken) {
    config.headers['X-CSRFToken'] = csrftoken;
  }
  return config;
});

export default api;
