import { Plan } from '../types/plan.types';
import { apiClient } from './apiClient';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  message: string;
  history?: ChatMessage[];
}

export interface ChatResponse {
  reply: string;
  model: string;
  elapsedMs: number;
}

export interface GeneratePlanResponse {
  planId: string;
  plan: Plan;
  message: string;
  model: string;
  elapsedMs: number;
}

export interface RefinePlanResponse {
  planId: string;
  plan: Plan;
  message: string;
  model: string;
  elapsedMs: number;
}

export const aiService = {
  async chat(data: ChatRequest): Promise<ChatResponse> {
    return apiClient('/ai/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async generatePlan(prompt: string): Promise<GeneratePlanResponse & {
    usedTemplateId?: string;
    usedTemplateName?: string;
    usedFrameworkId?: string;
    usedFrameworkName?: string;
  }> {
    return apiClient('/ai/generate-plan', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
  },

  async refinePlan(planId: string, instruction: string): Promise<RefinePlanResponse> {
    return apiClient('/ai/refine-plan', {
      method: 'POST',
      body: JSON.stringify({ planId, instruction }),
    });
  }
};
