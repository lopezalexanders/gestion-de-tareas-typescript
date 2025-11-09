import {
  CreateTaskInput,
  MAX_DESCRIPTION_LENGTH,
  MAX_TITLE_LENGTH,
  Task,
  TaskStatus,
  UpdateTaskStatusInput,
  isValidStatus,
} from '../domain/task';
import { TaskRepository } from '../repositories/taskRepository';
import { ConflictError, NotFoundError, ValidationError } from './errors';

const ALLOWED_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  pending: ['in_progress', 'done'],
  in_progress: ['done'],
  done: [],
};

export class TaskService {
  constructor(private readonly repository: TaskRepository) {}

  async createTask(input: Partial<CreateTaskInput>): Promise<Task> {
    const trimmedDescription = input.description?.trim();
    const normalizedTitle = input.title?.trim();
    const normalized: Partial<CreateTaskInput> = {
      title: normalizedTitle,
      description: trimmedDescription ? trimmedDescription : null,
      status: input.status,
    };
    const errors = this.validateCreateInput(normalized);
    if (errors.length > 0) {
      throw new ValidationError(errors);
    }
    return this.repository.createTask({
      title: normalizedTitle!,
      description: normalized.description,
      status: normalized.status,
    });
  }

  async listTasks(params: {
    status?: string;
    q?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ items: Task[]; total: number }> {
    const errors: string[] = [];
    let status: TaskStatus | undefined;
    if (params.status !== undefined) {
      if (!isValidStatus(params.status)) {
        errors.push('status must be one of pending, in_progress, done');
      } else {
        status = params.status;
      }
    }
    let limit = 20;
    if (params.limit !== undefined) {
      if (!Number.isInteger(params.limit) || params.limit < 1 || params.limit > 100) {
        errors.push('limit must be an integer between 1 and 100');
      } else {
        limit = params.limit;
      }
    }
    let offset = 0;
    if (params.offset !== undefined) {
      if (!Number.isInteger(params.offset) || params.offset < 0) {
        errors.push('offset must be a non-negative integer');
      } else {
        offset = params.offset;
      }
    }
    const q = params.q?.trim();
    if (errors.length > 0) {
      throw new ValidationError(errors);
    }
    return this.repository.listTasks({ status, q, limit, offset });
  }

  async updateTaskStatus(id: string, input: Partial<UpdateTaskStatusInput>): Promise<Task> {
    if (!input.status || !isValidStatus(input.status)) {
      throw new ValidationError(['status must be one of pending, in_progress, done']);
    }
    const task = await this.repository.findTaskById(id);
    if (!task) {
      throw new NotFoundError('Task not found');
    }
    if (!ALLOWED_TRANSITIONS[task.status].includes(input.status)) {
      throw new ConflictError('INVALID_TRANSITION', `Cannot transition from ${task.status} to ${input.status}`);
    }
    const updated = await this.repository.updateTaskStatus(id, input.status);
    if (!updated) {
      throw new NotFoundError('Task not found');
    }
    return updated;
  }

  private validateCreateInput(input: Partial<CreateTaskInput>): string[] {
    const errors: string[] = [];
    if (!input.title || input.title.length === 0) {
      errors.push('title is required');
    }
    if (input.title && input.title.length > MAX_TITLE_LENGTH) {
      errors.push(`title must be at most ${MAX_TITLE_LENGTH} characters`);
    }
    if (input.description && input.description.length > MAX_DESCRIPTION_LENGTH) {
      errors.push(`description must be at most ${MAX_DESCRIPTION_LENGTH} characters`);
    }
    if (input.status !== undefined && !isValidStatus(input.status)) {
      errors.push('status must be one of pending, in_progress, done');
    }
    return errors;
  }
}
