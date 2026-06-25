import { apiClient } from './apiClient';
import { ApiResponse } from './authService';
import { Notification } from '../types/notification.types';

export const notificationService = {
  async getNotifications(limit: number = 50): Promise<ApiResponse<Notification[]>> {
    return apiClient(`/Notifications?limit=${limit}`, {
      method: 'GET',
    });
  },

  async getUnreadCount(): Promise<ApiResponse<number>> {
    return apiClient('/Notifications/unread-count', {
      method: 'GET',
    });
  },

  async markAsRead(id: string): Promise<ApiResponse<boolean>> {
    return apiClient(`/Notifications/${id}/read`, {
      method: 'PUT',
    });
  },

  async markAllAsRead(): Promise<ApiResponse<boolean>> {
    return apiClient('/Notifications/read-all', {
      method: 'PUT',
    });
  }
};
