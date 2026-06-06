/**
 * Debugging utilities untuk development
 * Enable logging, error tracking, dan network monitoring
 */

import axios from 'axios';
import { useAuthStore } from '../stores/auth.store';

/**
 * Logger dengan emoji prefix (lebih readable di terminal/emulator)
 * %c color codes hanya bekerja di browser DevTools, bukan di terminal React Native
 */
export const logger = {
  info: (msg: string, data?: any) => {
    console.log(`ℹ️  [INFO] ${msg}`, data);
  },
  error: (msg: string, data?: any) => {
    console.error(`❌ [ERROR] ${msg}`, data);
  },
  warn: (msg: string, data?: any) => {
    console.warn(`⚠️  [WARN] ${msg}`, data);
  },
  debug: (msg: string, data?: any) => {
    if (__DEV__) {
      console.log(`🐛 [DEBUG] ${msg}`, data);
    }
  },
};

/**
 * Setup Axios interceptors untuk monitoring network
 */
export const setupAxiosInterceptors = () => {
  // Request interceptor
  axios.interceptors.request.use(
    (config) => {
      // Read current token from zustand store without using React hooks
      const token = useAuthStore.getState().token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      if (__DEV__) {
        logger.debug('HTTP Request', {
          method: config.method?.toUpperCase(),
          url: config.url,
          params: config.params,
          data: config.data,
        });
      }

      return config;
    },
    (error) => {
      logger.error('Request Setup Error', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor
  axios.interceptors.response.use(
    (response) => {
      if (__DEV__) {
        logger.debug('HTTP Response', {
          status: response.status,
          url: response.config.url,
          data: response.data,
        });
      }
      return response;
    },
    (error) => {
      logger.error('HTTP Error', {
        status: error.response?.status,
        url: error.config?.url,
        message: error.response?.data?.message || error.message,
      });
      return Promise.reject(error);
    }
  );
};

/**
 * Setup global error handler
 */
export const setupGlobalErrorHandler = () => {
  // Handle unhandled promise rejections
  if (__DEV__) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).unhandledRejection = (reason: any, promise: Promise<any>) => {
      logger.error('Unhandled Promise Rejection', { reason, promise });
    };
  }
};

/**
 * Log app state untuk debugging
 */
export const logAppState = () => {
  if (__DEV__) {
    // Use getState to read zustand outside React components
    const authState = useAuthStore.getState();
    logger.debug('Current App State', {
      isAuth: authState.isAuth,
      user: authState.user,
      hasToken: !!authState.token,
    });
  }
};
