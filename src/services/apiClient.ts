import { getAccessToken, getRefreshToken, saveAuthData, clearAuthData } from '../utils/token';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://localhost:7031/api').replace(/\/$/, '');

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

export const apiClient = async (endpoint: string, options: RequestOptions = {}) => {
  const { skipAuth = false, headers = {}, ...restOptions } = options;

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${cleanEndpoint}`;

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (!skipAuth) {
    const token = getAccessToken();
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const mergedHeaders: Record<string, string> = {
    ...defaultHeaders,
    ...(headers as Record<string, string>),
  };

  if (restOptions.body instanceof FormData) {
    delete mergedHeaders['Content-Type'];
  }

  const executeRequest = async (): Promise<any> => {
    const response = await fetch(url, {
      ...restOptions,
      headers: mergedHeaders,
    });

    // Read response body first
    const contentType = response.headers.get('content-type');
    let resData: any;
    if (contentType && contentType.includes('application/json')) {
      resData = await response.json().catch(() => ({}));
    } else {
      resData = await response.text();
    }

    if (response.status === 401 && !skipAuth) {
      // If the 401 response contains a custom error message (e.g. business logic error),
      // do not refresh the token and instead show the error message.
      const hasCustomError = resData && (resData.message || resData.error || resData.detail);
      if (hasCustomError) {
        throw new Error(resData.message || resData.error || resData.detail);
      }

      const rToken = getRefreshToken();
      if (!rToken) {
        clearAuthData();
        window.dispatchEvent(new StorageEvent('storage', { key: 'accessToken', newValue: null }));
        // If it's a GET request, retry anonymously
        if (restOptions.method === 'GET' || !restOptions.method) {
          return apiClient(endpoint, { ...options, skipAuth: true });
        }
        throw new Error('Unauthorized');
      }

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshRes = await fetch(`${API_BASE_URL}/Auth/refresh-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: rToken }),
          });

          if (!refreshRes.ok) {
            throw new Error('Refresh failed');
          }

          const refreshData = await refreshRes.json();
          const authData = refreshData.data || refreshData;
          saveAuthData(authData);
          isRefreshing = false;
          onRefreshed(authData.accessToken);
        } catch (err) {
          isRefreshing = false;
          clearAuthData();
          window.dispatchEvent(new StorageEvent('storage', { key: 'accessToken', newValue: null })); // Notify components to reload/logout
          
          // If it's a GET request, retry anonymously
          if (restOptions.method === 'GET' || !restOptions.method) {
            return apiClient(endpoint, { ...options, skipAuth: true });
          }
          throw new Error('Unauthorized');
        }
      }

      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((newToken) => {
          mergedHeaders['Authorization'] = `Bearer ${newToken}`;
          fetch(url, {
            ...restOptions,
            headers: mergedHeaders,
          })
            .then(async (res) => {
              const retryResData = await res.json().catch(() => ({}));
              if (!res.ok) {
                // If it failed with 401 even after refreshing, retry anonymously for GET requests
                if (res.status === 401 && (restOptions.method === 'GET' || !restOptions.method)) {
                  apiClient(endpoint, { ...options, skipAuth: true }).then(resolve).catch(reject);
                } else {
                  reject(new Error(retryResData.message || retryResData.error || retryResData.detail || `Request failed with status ${res.status}`));
                }
              } else {
                resolve(retryResData.data !== undefined ? retryResData : { data: retryResData });
              }
            })
            .catch(reject);
        });
      });
    }

    if (response.status === 405) {
      throw new Error('Method Not Allowed');
    }

    if (!response.ok) {
      const errorMsg = 
        resData?.message || 
        resData?.error || 
        resData?.detail || 
        (typeof resData === 'string' ? resData : null) || 
        `Request failed with status ${response.status}`;
      throw new Error(errorMsg);
    }

    // Keep response format consistency (like returning ApiResponse<T>)
    return resData;
  };

  return executeRequest();
};
