import { apiClient } from './apiClient';
import { ApiResponse } from './authService';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
}

export interface UserAdminResponse {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
  planName?: string;
  planStatus?: string;
  subscriptionExpiresAt?: string;
}

export const userService = {
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    return apiClient('/User/profile', {
      method: 'GET',
    });
  },

  async adminGetAllUsers(): Promise<ApiResponse<UserAdminResponse[]>> {
    return apiClient('/admin/users', {
      method: 'GET',
    });
  }
};
