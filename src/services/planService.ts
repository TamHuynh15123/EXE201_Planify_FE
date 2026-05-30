import { CreatePlanDto, CreatePlanTaskDto, Plan, PlanTask } from '../types/plan.types';
import { ApiResponse, authService } from './authService';

const API_BASE_URL = 'https://localhost:7031/api';

const getHeaders = () => {
  const token = authService.getAccessToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const planService = {
  async createManualPlan(data: CreatePlanDto): Promise<ApiResponse<Plan>> {
    const response = await fetch(`${API_BASE_URL}/Plans`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Không thể tạo kế hoạch');
    return result;
  },

  async createPlanTask(planId: string, data: CreatePlanTaskDto): Promise<ApiResponse<PlanTask>> {
    const response = await fetch(`${API_BASE_URL}/Plans/${planId}/tasks`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Không thể thêm nhiệm vụ');
    return result;
  },

  async updateTaskStatus(planId: string, taskId: string, status: string): Promise<ApiResponse<PlanTask>> {
    const response = await fetch(`${API_BASE_URL}/Plans/${planId}/tasks/${taskId}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Không thể cập nhật trạng thái');
    return result;
  },

  async getPlanById(id: string): Promise<ApiResponse<Plan>> {
    const response = await fetch(`${API_BASE_URL}/Plans/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authService.getAccessToken()}`
      },
    });
    if (response.status === 405) throw new Error('Backend chưa hỗ trợ lấy danh sách (Method Not Allowed)');
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Không thể lấy thông tin kế hoạch');
    return result;
  },

  async getAllPlans(): Promise<ApiResponse<Plan[]>> {
    const response = await fetch(`${API_BASE_URL}/Plans`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authService.getAccessToken()}`
      },
    });
    if (response.status === 405) throw new Error('Backend chưa hỗ trợ lấy danh sách (Method Not Allowed)');
    if (response.status === 401) throw new Error('Phiên đăng nhập hết hạn');
    
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Không thể lấy danh sách kế hoạch');
    return result;
  },

  async confirmPlan(planId: string): Promise<ApiResponse<Plan>> {
    const response = await fetch(`${API_BASE_URL}/Plans/${planId}/confirm`, {
      method: 'POST',
      headers: getHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Không thể xác nhận kế hoạch');
    return result;
  },

  async deleteDraftPlan(planId: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_BASE_URL}/Plans/${planId}/draft`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Không thể hủy bản nháp');
    return result;
  }
};
