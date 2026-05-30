import { ApiResponse, authService } from './authService';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
}

const API_BASE_URL = 'https://localhost:7031/api';

const getHeaders = () => {
  const token = authService.getAccessToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const userService = {
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (response.status === 401) {
      throw new Error('Unauthorized');
    }

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Không thể lấy thông tin người dùng');
    }
    return result;
  }
};
