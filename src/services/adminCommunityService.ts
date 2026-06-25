import { apiClient } from './apiClient';
import { ApiResponse } from './authService';
import { CommunityPlanSummary, CommunityPlan, PagedResult } from '../types/community.types';

export const adminCommunityService = {
  async getPending(page: number = 1, pageSize: number = 20): Promise<ApiResponse<PagedResult<CommunityPlanSummary>>> {
    return apiClient(`/admin/community-plans/pending?page=${page}&pageSize=${pageSize}`, {
      method: 'GET',
    });
  },

  async getDetail(id: string): Promise<ApiResponse<CommunityPlan>> {
    return apiClient(`/admin/community-plans/${id}`, {
      method: 'GET',
    });
  },

  async approve(id: string): Promise<ApiResponse<{ message: string; communityPlan: CommunityPlan }>> {
    return apiClient(`/admin/community-plans/${id}/approve`, {
      method: 'POST',
    });
  },

  async reject(id: string, reason: string): Promise<ApiResponse<{ message: string; communityPlan: CommunityPlan }>> {
    return apiClient(`/admin/community-plans/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  async delete(id: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient(`/admin/community-plans/${id}`, {
      method: 'DELETE',
    });
  }
};
