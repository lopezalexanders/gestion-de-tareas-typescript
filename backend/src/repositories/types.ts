import { Task, TaskStatus } from '../domain/Task.js';

export interface CreateTaskParams {
  title: string;
  description?: string | null;
  status?: TaskStatus;
}

export interface FindTasksFilters {
  status?: TaskStatus;
  query?: string;
  limit?: number;
  offset?: number;
}

export interface TaskRepository {
  create(task: CreateTaskParams): Promise<Task>;
  findById(id: string): Promise<Task | null>;
  findAll(filters: FindTasksFilters): Promise<Task[]>;
  updateStatus(id: string, status: TaskStatus): Promise<Task | null>;
}
