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

export interface OnboardingStatus {
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped';
  step: number;
  shouldShowTour: boolean;
}

export interface DailyRegistration {
  date: string; // "YYYY-MM-DD"
  count: number;
}

export interface UserGrowthStats {
  totalUsers: number;
  newUsers: number;
  newUsersLast7Days: number;
  newUsersLast30Days: number;
  growthRatePercent: number | null;
  dailyRegistrations: DailyRegistration[];
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
  },

  async adminGetGrowthStats(from?: string, to?: string): Promise<ApiResponse<UserGrowthStats>> {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiClient(`/admin/users/growth-stats${query}`, { method: 'GET' });
  },

  async getOnboardingStatus(): Promise<ApiResponse<OnboardingStatus>> {
    return apiClient('/User/onboarding', {
      method: 'GET',
    });
  },

  async updateOnboarding(status: string, step: number): Promise<ApiResponse<OnboardingStatus>> {
    return apiClient('/User/onboarding', {
      method: 'PUT',
      body: JSON.stringify({ status, step }),
    });
  },
};
