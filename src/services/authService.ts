const API_BASE_URL = 'https://localhost:7031/api';

export interface UserData {
  email: string;
  fullName: string;
  role?: string;
  accessTokenExpiration: string;
  refreshTokenExpiration: string;
}

export interface AuthResponseData {
  accessToken: string;
  refreshToken: string;
  email: string;
  fullName: string;
  role?: string;
  accessTokenExpiration: string;
  refreshTokenExpiration: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export interface RegisterData {
  email: string;
  fullName: string;
  password?: string;
}

export interface LoginData {
  email: string;
  password?: string;
}

export const authService = {
  async register(data: RegisterData): Promise<ApiResponse<AuthResponseData>> {
    const response = await fetch(`${API_BASE_URL}/Auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok || (result.statusCode && result.statusCode >= 400)) {
      throw new Error(result.message || 'Đăng ký thất bại');
    }
    return result;
  },

  async login(data: LoginData): Promise<ApiResponse<AuthResponseData>> {
    const response = await fetch(`${API_BASE_URL}/Auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok || (result.statusCode && result.statusCode >= 400)) {
      throw new Error(result.message || 'Đăng nhập thất bại');
    }
    return result;
  },

  async googleLogin(idToken: string): Promise<ApiResponse<AuthResponseData>> {
    const response = await fetch(`${API_BASE_URL}/Auth/google-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
    const result = await response.json();
    if (!response.ok || (result.statusCode && result.statusCode >= 400)) {
      throw new Error(result.message || 'Đăng nhập Google thất bại');
    }
    return result;
  },

  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthResponseData>> {
    const response = await fetch(`${API_BASE_URL}/Auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const result = await response.json();
    if (!response.ok || (result.statusCode && result.statusCode >= 400)) {
      throw new Error(result.message || 'Làm mới token thất bại');
    }
    return result;
  },

  async logout(accessToken: string, refreshToken: string): Promise<ApiResponse<null>> {
    const response = await fetch(`${API_BASE_URL}/Auth/logout`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ refreshToken }),
    });
    const result = await response.json();
    return result;
  },

  saveAuthData(data: AuthResponseData) {
    // Decode role from JWT if not provided in response
    let role = data.role;
    if (!role && data.accessToken) {
      try {
        const payload = JSON.parse(atob(data.accessToken.split('.')[1]));
        role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload['role'];
      } catch (e) {
        console.error('Error decoding token role:', e);
      }
    }

    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify({
      email: data.email,
      fullName: data.fullName,
      role: role,
      accessTokenExpiration: data.accessTokenExpiration,
      refreshTokenExpiration: data.refreshTokenExpiration
    }));
  },

  clearAuthData() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  getAccessToken() {
    return localStorage.getItem('accessToken');
  },

  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  },

  getUser(): UserData | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};
