import { apiClient } from './apiClient';
import { ApiResponse } from './authService';

export interface PlanFramework {
  id: string;
  name: string;
  slug: string;
  description?: string;
  structure: string;
  keywords?: string;
  isActive: boolean;
}

export interface PlanTemplate {
  id: string;
  frameworkId?: string;
  frameworkName?: string;
  title: string;
  description?: string;
  templateContent: string;
  isActive: boolean;
}

export const planFrameworkService = {
  async getActiveFrameworks(): Promise<ApiResponse<PlanFramework[]>> {
    return apiClient('/plan-frameworks', {
      method: 'GET',
    });
  },

  async getTemplatesByFramework(frameworkId: string): Promise<ApiResponse<PlanTemplate[]>> {
    return apiClient(`/plan-frameworks/${frameworkId}/templates`, {
      method: 'GET',
    });
  }
};
