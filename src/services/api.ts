import axios from 'axios'
import { useAuthStore } from '../stores/auth.store'
import { logger } from '../utils/debug'

// 10.0.2.2 = alias ke localhost laptop dari emulator Android
const api = axios.create({
  baseURL:    __DEV__ ? 'http://10.0.2.2:3100' : 'https://cikaret-api.up.railway.app',
  headers:    { 'Content-Type': 'application/json'},
  timeout:    10000 // 10s
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if(token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  if (__DEV__) {
    logger.debug('API Request', {
      method: config.method?.toUpperCase(),
      url: config.url,
      hasToken: !!token,
    });
  }
  
  return config;
})

api.interceptors.response.use((response) => {
  if (__DEV__) {
    logger.debug('API Response', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
  }
  return response;
}, (error) => {
  if (__DEV__) {
    logger.error('API Error', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config?.url,
    });
  }
  
  if(error.response?.status === 401) {
    useAuthStore.getState().logout()
  }
  return Promise.reject(error);
})

export default api;