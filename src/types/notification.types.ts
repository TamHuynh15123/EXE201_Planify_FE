export interface Notification {
  id: string;
  title: string | null;
  message: string | null;
  type: string | null; // e.g. 'deadline', 'system', etc.
  isRead: boolean;
  referenceId: string | null;
  createdAt: string;
}
