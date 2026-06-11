import { apiClient } from './apiClient';
import { ApiResponse } from './authService';
import { PlanTemplate, CreatePlanTemplateDto, UpdatePlanTemplateDto } from '../types/admin.types';

export const adminTemplateService = {
  async getAll(): Promise<ApiResponse<PlanTemplate[]>> {
    return apiClient('/admin/plan-templates', {
      method: 'GET',
    });
  },

  async getById(id: string): Promise<ApiResponse<PlanTemplate>> {
    return apiClient(`/admin/plan-templates/${id}`, {
      method: 'GET',
    });
  },

  async getByFrameworkId(frameworkId: string): Promise<ApiResponse<PlanTemplate[]>> {
    return apiClient(`/admin/plan-templates/framework/${frameworkId}`, {
      method: 'GET',
    });
  },

  async create(data: CreatePlanTemplateDto): Promise<ApiResponse<PlanTemplate>> {
    const formData = new FormData();
    if (data.frameworkId) formData.append('frameworkId', data.frameworkId);
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    formData.append('templateContent', data.templateContent);
    formData.append('isActive', String(data.isActive));

    return apiClient('/admin/plan-templates/from-text', {
      method: 'POST',
      body: formData,
    });
  },

  async update(id: string, data: UpdatePlanTemplateDto): Promise<ApiResponse<PlanTemplate>> {
    const backendData = {
      ...data,
      templateContent: data.templateContent.split('\n'),
    };
    return apiClient(`/admin/plan-templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(backendData),
    });
  },

  async deactivate(id: string): Promise<ApiResponse<boolean>> {
    return apiClient(`/admin/plan-templates/${id}/deactivate`, {
      method: 'DELETE',
    });
  },

  async delete(id: string): Promise<ApiResponse<boolean>> {
    return apiClient(`/admin/plan-templates/${id}`, {
      method: 'DELETE',
    });
  }
};
