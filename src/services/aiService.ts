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

// ── Delay Alert Types ─────────────────────────────────────────────────────────

export interface AnalyzeDelayResponse {
  proposedPlanData: any; // JSON plan đề xuất từ AI (chưa lưu DB)
  message: string;       // Giải thích của AI
  strategy: 'reschedule' | 'extend_deadline';
  overdueCount: number;
  daysToDeadline: number;
  model: string;
  elapsedMs: number;
}

export interface ApplyDelayFixResponse {
  message: string;
  planId: string;
  plan: Plan;
}

// ── Service ───────────────────────────────────────────────────────────────────

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
  },

  /**
   * Phân tích tình trạng trễ tiến độ của plan.
   * POST /api/ai/analyze-delay
   * Chỉ trả về đề xuất, KHÔNG lưu DB.
   * @param forceStrategy Nếu truyền vào, BE sẽ ép AI dùng strategy này (dùng khi user "không đồng ý" với đề xuất ban đầu).
   */
  async analyzeDelay(planId: string, forceStrategy?: 'reschedule' | 'extend_deadline'): Promise<AnalyzeDelayResponse> {
    return apiClient('/ai/analyze-delay', {
      method: 'POST',
      body: JSON.stringify({ planId, forceStrategy }),
    });
  },

  /**
   * Áp dụng đề xuất AI vào DB sau khi user xác nhận.
   * POST /api/ai/apply-delay-fix
   */
  async applyDelayFix(planId: string, proposedPlanData: any): Promise<ApplyDelayFixResponse> {
    return apiClient('/ai/apply-delay-fix', {
      method: 'POST',
      body: JSON.stringify({ planId, planData: proposedPlanData }),
    });
  },
};
