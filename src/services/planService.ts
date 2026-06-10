import { CreatePlanDto, CreatePlanTaskDto, Plan, PlanTask } from '../types/plan.types';
import { ApiResponse } from './authService';
import { apiClient } from './apiClient';

export const planService = {
  async createManualPlan(data: CreatePlanDto): Promise<ApiResponse<Plan>> {
    return apiClient('/Plans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async createPlanTask(planId: string, data: CreatePlanTaskDto): Promise<ApiResponse<PlanTask>> {
    return apiClient(`/Plans/${planId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateTaskStatus(planId: string, taskId: string, status: string): Promise<ApiResponse<PlanTask>> {
    return apiClient(`/Plans/${planId}/tasks/${taskId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  async getPlanById(id: string): Promise<ApiResponse<Plan>> {
    return apiClient(`/Plans/${id}`, {
      method: 'GET',
    });
  },

  async getAllPlans(): Promise<ApiResponse<Plan[]>> {
    return apiClient('/Plans', {
      method: 'GET',
    });
  },

  async confirmPlan(planId: string): Promise<ApiResponse<Plan>> {
    return apiClient(`/Plans/${planId}/confirm`, {
      method: 'POST',
    });
  },

  async deleteDraftPlan(planId: string): Promise<ApiResponse<void>> {
    return apiClient(`/Plans/${planId}/draft`, {
      method: 'DELETE',
    });
  },

  async deletePlan(planId: string): Promise<ApiResponse<void>> {
    return apiClient(`/Plans/${planId}`, {
      method: 'DELETE',
    });
  },

  async updatePlanTask(planId: string, taskId: string, data: any): Promise<ApiResponse<PlanTask>> {
    return apiClient(`/Plans/${planId}/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deletePlanTask(planId: string, taskId: string): Promise<ApiResponse<void>> {
    return apiClient(`/Plans/${planId}/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }
};
