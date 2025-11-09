export type TaskStatus = 'pending' | 'in_progress' | 'done';

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

export const TASK_STATUSES: TaskStatus[] = ['pending', 'in_progress', 'done'];

export const isValidStatus = (status: string): status is TaskStatus =>
  (TASK_STATUSES as string[]).includes(status);

export const canTransition = (from: TaskStatus, to: TaskStatus): boolean => {
  if (from === to) {
    return true;
  }
  if (from === 'pending') {
    return to === 'in_progress' || to === 'done';
  }
  if (from === 'in_progress') {
    return to === 'done';
  }
  return false;
};
