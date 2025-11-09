import { CreateTaskInput, Task, TaskStatus } from '../domain/task';

export interface TaskRepository {
  init(): Promise<void>;
  createTask(input: CreateTaskInput): Promise<Task>;
  listTasks(params: {
    status?: TaskStatus;
    q?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ items: Task[]; total: number }>;
  findTaskById(id: string): Promise<Task | null>;
  updateTaskStatus(id: string, status: TaskStatus): Promise<Task | null>;
}
