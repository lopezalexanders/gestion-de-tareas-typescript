import createHttpError from 'http-errors';

import { Task, TaskStatus, canTransition } from '../domain/Task.js';
import { CreateTaskParams, FindTasksFilters, TaskRepository } from '../repositories/types.js';
import { taskRepository } from '../repositories/tasks.repository.js';
import { logger } from '../observability/logger.js';

export interface TasksServiceDependencies {
  repository?: TaskRepository;
}

export class TasksService {
  private readonly repository: TaskRepository;

  constructor({ repository = taskRepository }: TasksServiceDependencies = {}) {
    this.repository = repository;
  }

  async createTask(params: CreateTaskParams): Promise<Task> {
    const task = await this.repository.create(params);
    logger.info({ event: 'task_created', taskId: task.id }, 'Task created');
    return task;
  }

  async listTasks(filters: FindTasksFilters): Promise<Task[]> {
    return this.repository.findAll(filters);
  }

  async updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
    const existingTask = await this.repository.findById(id);
    if (!existingTask) {
      throw new createHttpError.NotFound(`Task with id ${id} not found`);
    }

    if (!canTransition(existingTask.status, status)) {
      const error = new createHttpError.Conflict(`Invalid status transition from ${existingTask.status} to ${status}`);
      (error as any).code = 'INVALID_TRANSITION';
      throw error;
    }

    const task = await this.repository.updateStatus(id, status);
    if (!task) {
      throw new createHttpError.InternalServerError('Failed to update task status');
    }
    logger.info({ event: 'task_status_updated', taskId: id, status }, 'Task status updated');
    return task;
  }
}

export const tasksService = new TasksService();
