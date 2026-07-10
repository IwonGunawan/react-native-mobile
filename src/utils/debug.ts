/**
 * Global error & network wiring.
 *
 * - Logger + persistent crash buffer: `./logcat`
 * - JS unhandled errors: `ErrorUtils.setGlobalHandler` (RN core)
 * - JS unhandled promise rejections: `unhandledrejection` event
 * - JS uncaught exceptions: `process.on('uncaughtException')` if available
 * - Axios interceptors for request/response/error logging
 *
 * Native force-close: tidak bisa dicegat dari JS. Cara membacanya:
 *   adb logcat -d -b crash                  # system crash buffer
 *   adb logcat *:E                          # semua error
 *   adb logcat -s ReactNativeJS:V           # semua log JS
 */

import axios from 'axios';
import { useAuthStore } from '../stores/auth.store';
import { logger } from './logcat';

export { logger } from './logcat';

/**
 * Setup Axios interceptors untuk monitoring network
 */
export const setupAxiosInterceptors = () => {
  axios.interceptors.request.use(
    (config) => {
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
    },
  );

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
    },
  );
};

/**
 * Install global handlers. Idempotent: aman dipanggil berulang.
 */
export const setupGlobalErrorHandler = () => {
  // 1) RN core: unhandled JS errors. `ErrorUtils` selalu ada di runtime RN.
  const ErrorUtils = (globalThis as any).ErrorUtils;
  if (ErrorUtils?.setGlobalHandler) {
    const previous = ErrorUtils.getGlobalHandler?.();
    ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
      logger.error(
        `Unhandled JS error${isFatal ? ' (FATAL)' : ''}`,
        error,
      );
      // Chain to default RN handler so red box / native crash still fires.
      previous?.(error, isFatal);
    });
  }

  // 2) Unhandled promise rejections. Polyfill `process` jika tidak ada.
  const proc: any = (globalThis as any).process ?? {
    on: () => {},
    addListener: () => {},
  };
  const onRejection = (reason: unknown) => {
    logger.error('Unhandled Promise Rejection', reason);
  };
  if (typeof proc.on === 'function') {
    proc.on('unhandledRejection', onRejection);
  }
  if (typeof proc.addListener === 'function') {
    proc.addListener('unhandledRejection', onRejection);
  }
  // `unhandledrejection` event di globalThis (Hermes meniru ini juga).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g: any = globalThis as any;
  if (typeof g.addEventListener === 'function') {
    g.addEventListener('unhandledrejection', (e: any) => {
      logger.error('Unhandled Promise Rejection', e?.reason ?? e);
    });
  }

  // 3) Uncaught exceptions (defensive — jarang di RN tapi berguna).
  const onException = (err: unknown) => {
    logger.error('Uncaught Exception', err);
  };
  if (typeof proc.on === 'function') {
    proc.on('uncaughtException', onException);
  }
};

/**
 * Log app state untuk debugging
 */
export const logAppState = () => {
  if (__DEV__) {
    const authState = useAuthStore.getState();
    logger.debug('Current App State', {
      isAuth: authState.isAuth,
      user: authState.user,
      hasToken: !!authState.token,
    });
  }
};
