import { apiClient } from './client';

export type TaskStatus = 'pending' | 'in_progress' | 'done';

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
}

export const fetchTasks = async (status?: TaskStatus) => {
  const response = await apiClient.get<Task[]>('/tasks', {
    params: { status },
  });
  return response.data;
};

export const createTask = async (payload: CreateTaskInput) => {
  const response = await apiClient.post<Task>('/tasks', payload);
  return response.data;
};

export const updateTaskStatus = async (id: string, status: TaskStatus) => {
  const response = await apiClient.put<Task>(`/tasks/${id}/status`, { status });
  return response.data;
};
