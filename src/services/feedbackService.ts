import { apiClient } from './apiClient';

export type FeedbackCategory =
  | 'ai_quality' | 'ui_ux' | 'performance' | 'bug_report'
  | 'feature_request' | 'content' | 'subscription' | 'general';

export interface SubmitGeneralFeedbackPayload {
  category: FeedbackCategory;
  title: string;
  description?: string;
  rating?: number;
}

export const feedbackService = {
  async submitGeneral(dto: SubmitGeneralFeedbackPayload): Promise<void> {
    await apiClient('/feedbacks', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },
};
