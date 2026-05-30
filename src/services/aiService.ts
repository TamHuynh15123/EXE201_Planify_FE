import { authService, ApiResponse } from './authService';
import { Plan } from '../types/plan.types';

const API_BASE_URL = 'https://localhost:7031/api/ai';

const getHeaders = () => {
  const token = authService.getAccessToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

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

export const aiService = {
  async chat(data: ChatRequest): Promise<ChatResponse> {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Lỗi khi trò chuyện với AI');
    return result;
  },

  async generatePlan(prompt: string): Promise<GeneratePlanResponse> {
    const response = await fetch(`${API_BASE_URL}/generate-plan`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ prompt }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Lỗi khi tạo kế hoạch bằng AI');
    return result;
  }
};
