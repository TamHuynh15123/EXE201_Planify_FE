import { apiClient } from './apiClient';
import { ApiResponse } from './authService';
import { 
  CommunityPlanSummary, 
  CommunityPlan, 
  CommunityPlanQuery, 
  PublishPlanDto, 
  PagedResult 
} from '../types/community.types';
import { Plan } from '../types/plan.types';

export const communityService = {
  async getLibrary(query: CommunityPlanQuery): Promise<ApiResponse<PagedResult<CommunityPlanSummary>>> {
    const params = new URLSearchParams();
    if (query.search) params.append('Search', query.search);
    if (query.categoryId) params.append('CategoryId', query.categoryId);
    if (query.sortBy) params.append('SortBy', query.sortBy);
    if (query.page) params.append('Page', query.page.toString());
    if (query.pageSize) params.append('PageSize', query.pageSize.toString());

    return apiClient(`/community-plans?${params.toString()}`, {
      method: 'GET',
    });
  },

  async getById(id: string): Promise<ApiResponse<CommunityPlan>> {
    return apiClient(`/community-plans/${id}`, {
      method: 'GET',
    });
  },

  async publishPlan(data: PublishPlanDto): Promise<ApiResponse<CommunityPlan>> {
    return apiClient('/community-plans/publish', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async copyPlan(id: string): Promise<ApiResponse<{ message: string; plan: Plan }>> {
    return apiClient(`/community-plans/${id}/copy`, {
      method: 'POST',
    });
  },

  async toggleLike(id: string): Promise<ApiResponse<{ isLiked: boolean; message: string }>> {
    return apiClient(`/community-plans/${id}/like`, {
      method: 'POST',
    });
  },

  async unpublishPlan(id: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient(`/community-plans/${id}`, {
      method: 'DELETE',
    });
  },

  async getMyPublishedPlans(): Promise<ApiResponse<CommunityPlanSummary[]>> {
    return apiClient('/community-plans/my', {
      method: 'GET',
    });
  },

  async submitPlanFeedback(dto: {
    planId: string;
    communityPlanId?: string;
    isEffective: boolean;
    reason?: string;
    suggestions?: string;
    rating?: number;
  }): Promise<ApiResponse<any>> {
    return apiClient('/community-plans/feedback', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }
};
