const API_BASE_URL = 'https://localhost:7031/api'; 
// Bạn cũng có thể thử: 'http://localhost:5240/api' nếu HTTPS gặp vấn đề về chứng chỉ

export interface AuthResponse {
  token: string;
  email: string;
  fullName: string;
  expiration: string;
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
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/Auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Register Error:', result);
        throw new Error(result.message || result.title || 'Đăng ký thất bại');
      }

      return result;
    } catch (error: any) {
      console.error('Fetch Register Error:', error);
      throw error;
    }
  },

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      console.log('Attempting login to:', `${API_BASE_URL}/Auth/login`);
      const response = await fetch(`${API_BASE_URL}/Auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Login Error Response:', result);
        // Xử lý lỗi từ ASP.NET Core Identity hoặc Custom Message
        const errorMessage = result.message || result.title || (result.errors ? Object.values(result.errors).flat().join(', ') : 'Đăng nhập thất bại');
        throw new Error(errorMessage);
      }

      return result;
    } catch (error: any) {
      console.error('Fetch Login Error:', error);
      if (error.message === 'Failed to fetch') {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra backend hoặc chứng chỉ SSL (HTTPS).');
      }
      throw error;
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getToken() {
    return localStorage.getItem('token');
  },

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  saveAuthData(data: AuthResponse) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify({
      email: data.email,
      fullName: data.fullName,
      expiration: data.expiration
    }));
  }
};
