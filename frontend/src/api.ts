import axios from 'axios';

// 优先使用环境变量配置的 API 地址，如果没有则回退到 localhost
// 企业级最佳实践：永远不要在代码中硬编码生产环境地址
const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';

console.log(`[API Config] Using API Base: ${API_BASE_URL} (Mode: ${import.meta.env.MODE})`);

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for Session Auth
  // Remove default Content-Type to allow Axios/Browser to set it correctly
  // (e.g. multipart/form-data with boundary for file uploads)
});

// 导出这个 URL 供其他组件使用（如 ChatWindowUseStream）
export { API_BASE_URL };

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
