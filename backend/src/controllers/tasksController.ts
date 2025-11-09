import { ServerResponse } from 'http';
import { TaskService } from '../services/taskService';
import { HttpRequest, sendJson } from '../utils/http';
import { ConflictError, NotFoundError, ValidationError } from '../services/errors';
import { logger } from '../observability/logger';
import { getRequestId } from '../observability/requestId';
import { CreateTaskInput, UpdateTaskStatusInput } from '../domain/task';

export class TasksController {
  constructor(private readonly service: TaskService) {}

  async createTask(req: HttpRequest, res: ServerResponse): Promise<void> {
    try {
      const task = await this.service.createTask((req.body ?? {}) as Partial<CreateTaskInput>);
      logger.info('task.created', { requestId: getRequestId(req), taskId: task.id, userId: req.user?.id });
      sendJson(res, 201, task);
    } catch (error) {
      this.handleError(req, res, error);
    }
  }

  async listTasks(req: HttpRequest, res: ServerResponse): Promise<void> {
    try {
      const { status, q, limit, offset } = req.query ?? {};
      const result = await this.service.listTasks({
        status,
        q,
        limit: limit ? Number(limit) : undefined,
        offset: offset ? Number(offset) : undefined,
      });
      sendJson(res, 200, result);
    } catch (error) {
      this.handleError(req, res, error);
    }
  }

  async updateTaskStatus(req: HttpRequest, res: ServerResponse): Promise<void> {
    try {
      const { id } = req.params ?? {};
      if (!id) {
        sendJson(res, 400, { code: 'BAD_REQUEST', message: 'Missing task id' });
        return;
      }
      const task = await this.service.updateTaskStatus(id, (req.body ?? {}) as Partial<UpdateTaskStatusInput>);
      logger.info('task.status_updated', {
        requestId: getRequestId(req),
        taskId: task.id,
        status: task.status,
        userId: req.user?.id,
      });
      sendJson(res, 200, task);
    } catch (error) {
      this.handleError(req, res, error);
    }
  }

  private handleError(req: HttpRequest, res: ServerResponse, error: unknown): void {
    if (error instanceof ValidationError) {
      sendJson(res, 400, { code: 'VALIDATION_ERROR', message: error.message, details: error.details });
      return;
    }
    if (error instanceof NotFoundError) {
      sendJson(res, 404, { code: 'NOT_FOUND', message: error.message });
      return;
    }
    if (error instanceof ConflictError) {
      sendJson(res, 409, { code: error.code, message: error.message });
      return;
    }
    if (error instanceof Error && error.message === 'INVALID_JSON') {
      sendJson(res, 400, { code: 'INVALID_JSON', message: 'Body must be valid JSON' });
      return;
    }
    logger.error('unexpected_error', { requestId: getRequestId(req), error: error as Error });
    sendJson(res, 500, { code: 'INTERNAL_ERROR', message: 'Unexpected error' });
  }
}
