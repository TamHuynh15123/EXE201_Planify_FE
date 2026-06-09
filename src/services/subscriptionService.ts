import { ApiResponse } from './authService';
import { apiClient } from './apiClient';
import { 
  SubscriptionPlan, 
  UserSubscription, 
  CreateSubscriptionPlanDto, 
  UpgradeSubscriptionDto 
} from '../types/subscription.types';

export const subscriptionService = {
  // Admin Endpoints
  async adminGetAllPlans(): Promise<ApiResponse<SubscriptionPlan[]>> {
    return apiClient('/admin/subscriptions/plans', {
      method: 'GET',
    });
  },

  async adminCreatePlan(data: CreateSubscriptionPlanDto): Promise<ApiResponse<SubscriptionPlan>> {
    return apiClient('/admin/subscriptions/plans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async adminUpdatePlan(id: string, data: CreateSubscriptionPlanDto): Promise<ApiResponse<SubscriptionPlan>> {
    return apiClient(`/admin/subscriptions/plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async adminDeactivatePlan(id: string): Promise<ApiResponse<void>> {
    return apiClient(`/admin/subscriptions/plans/${id}`, {
      method: 'DELETE',
    });
  },

  async adminGetRevenueStatistics(): Promise<ApiResponse<{
    totalRevenue: number;
    successCount: number;
    newUsersCount: number;
    dailyRevenue: Array<{ year: number; month: number; day: number; revenue: number }>;
    monthlyRevenue: Array<{ year: number; month: number; revenue: number }>;
    yearlyRevenue: Array<{ year: number; revenue: number }>;
  }>> {
    return apiClient('/admin/subscriptions/statistics', {
      method: 'GET',
    });
  },

  // User Endpoints
  async getActivePlans(): Promise<ApiResponse<SubscriptionPlan[]>> {
    return apiClient('/subscriptions/plans', {
      method: 'GET',
      skipAuth: true,
    });
  },

  async getCurrentSubscription(): Promise<ApiResponse<UserSubscription>> {
    return apiClient('/subscriptions/current', {
      method: 'GET',
    });
  },

  async upgradeSubscription(data: UpgradeSubscriptionDto): Promise<ApiResponse<any>> {
    return apiClient('/subscriptions/upgrade', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async checkStatus(orderCode: string): Promise<ApiResponse<{ status: string; message?: string }>> {
    return apiClient(`/subscriptions/check-status/${orderCode}`, {
      method: 'GET',
    });
  },

  async getCheckoutInfo(orderCode: string): Promise<ApiResponse<any>> {
    return apiClient(`/subscriptions/checkout-info/${orderCode}`, {
      method: 'GET',
      skipAuth: true,
    });
  }
};
