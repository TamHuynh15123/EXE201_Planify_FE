export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface CreatePlanDto {
  title: string;
  description: string;
  goal: string;
  templateId: string | null;
  frameworkId: string | null;
  categoryId: string;
  isPublic: boolean;
  deadline: string;
}

export interface CreatePlanTaskDto {
  title: string;
  parentTaskId: string | null;
  description: string;
  priority: TaskPriority;
  startDate: string;
  dueDate: string;
  orderIndex: number;
}

export interface PlanTask {
  id: string;
  title: string;
  description: string;
  parentTaskId: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  progress: number;
  startDate: string;
  dueDate: string;
  completedAt: string | null;
  subTasks?: PlanTask[];
}

export interface Plan {
  id: string;
  title: string;
  description: string;
  goal: string;
  status: string;
  progress: number;
  isPublic: boolean;
  isAIGenerated: boolean;
  deadline: string;
  createdAt: string;
  tasks: PlanTask[];
}
