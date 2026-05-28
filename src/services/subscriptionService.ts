import { ApiResponse, authService } from './authService';
import { 
  SubscriptionPlan, 
  UserSubscription, 
  CreateSubscriptionPlanDto, 
  UpgradeSubscriptionDto 
} from '../types/subscription.types';

const API_BASE_URL = 'https://localhost:7031/api';

const getHeaders = () => {
  const token = authService.getAccessToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const subscriptionService = {
  // Admin Endpoints
  async adminGetAllPlans(): Promise<ApiResponse<SubscriptionPlan[]>> {
    const response = await fetch(`${API_BASE_URL}/admin/subscriptions/plans`, {
      method: 'GET',
      headers: getHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Không thể lấy danh sách gói');
    return result;
  },

  async adminCreatePlan(data: CreateSubscriptionPlanDto): Promise<ApiResponse<SubscriptionPlan>> {
    const response = await fetch(`${API_BASE_URL}/admin/subscriptions/plans`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Không thể tạo gói mới');
    return result;
  },

  async adminUpdatePlan(id: string, data: CreateSubscriptionPlanDto): Promise<ApiResponse<SubscriptionPlan>> {
    const response = await fetch(`${API_BASE_URL}/admin/subscriptions/plans/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Không thể cập nhật gói');
    return result;
  },

  async adminDeactivatePlan(id: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_BASE_URL}/admin/subscriptions/plans/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Không thể vô hiệu hóa gói');
    return result;
  },

  // User Endpoints
  async getActivePlans(): Promise<ApiResponse<SubscriptionPlan[]>> {
    const response = await fetch(`${API_BASE_URL}/subscriptions/plans`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Không thể lấy danh sách gói');
    return result;
  },

  async getCurrentSubscription(): Promise<ApiResponse<UserSubscription>> {
    const response = await fetch(`${API_BASE_URL}/subscriptions/current`, {
      method: 'GET',
      headers: getHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Không thể lấy thông tin gói hiện tại');
    return result;
  },

  async upgradeSubscription(data: UpgradeSubscriptionDto): Promise<ApiResponse<UserSubscription>> {
    const response = await fetch(`${API_BASE_URL}/subscriptions/upgrade`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Nâng cấp thất bại');
    return result;
  }
};
