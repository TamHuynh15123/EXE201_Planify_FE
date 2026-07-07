import { apiClient } from './apiClient';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface GeneralFeedbackItem {
  id: string;
  userId: string;
  userName?: string;
  category: string;
  title: string;
  description?: string;
  rating?: number;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: string;
  updatedAt: string;
}

export interface PlanFeedbackItem {
  id: string;
  planId: string;
  userId: string;
  communityPlanId?: string;
  isEffective: boolean;
  reason?: string;
  suggestions?: string;
  rating?: number;
  planTitle?: string;
  userName?: string;
  createdAt: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// ── Service ───────────────────────────────────────────────────────────────────

export const adminFeedbackService = {
  // General Feedback
  async getGeneralFeedbacks(
    page = 1,
    pageSize = 20,
    category?: string,
    status?: string,
  ): Promise<PagedResult<GeneralFeedbackItem>> {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (category) params.append('category', category);
    if (status)   params.append('status', status);
    const res = await apiClient(`/admin/feedbacks?${params}`, { method: 'GET' });
    return (res as any).data ?? res;
  },

  async updateGeneralFeedbackStatus(id: string, status: string): Promise<void> {
    await apiClient(`/admin/feedbacks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Plan Feedback (AI Effectiveness Survey)
  async getPlanFeedbacks(page = 1, pageSize = 20): Promise<PagedResult<PlanFeedbackItem>> {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    const res = await apiClient(`/admin/community-plans/feedbacks?${params}`, { method: 'GET' });
    return (res as any).data ?? res;
  },
};
