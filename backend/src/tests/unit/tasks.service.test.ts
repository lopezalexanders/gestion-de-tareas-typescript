import { describe, expect, it, vi, beforeEach } from 'vitest';

import { TaskStatus } from '../../domain/Task.js';
import { TasksService } from '../../services/tasks.service.js';
import { CreateTaskParams, TaskRepository } from '../../repositories/types.js';

const createRepositoryMock = () => {
  const repo: TaskRepository = {
    create: vi.fn(),
    findById: vi.fn(),
    findAll: vi.fn(),
    updateStatus: vi.fn(),
  };
  return repo;
};

describe('TasksService', () => {
  let repository: TaskRepository;
  let service: TasksService;

  beforeEach(() => {
    repository = createRepositoryMock();
    service = new TasksService({ repository });
  });

  it('creates a task and logs', async () => {
    const payload: CreateTaskParams = { title: 'Test', description: 'desc' };
    const expectedTask = {
      id: '1',
      title: 'Test',
      description: 'desc',
      status: 'pending' as TaskStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    (repository.create as any).mockResolvedValue(expectedTask);

    const task = await service.createTask(payload);

    expect(task).toEqual(expectedTask);
    expect(repository.create).toHaveBeenCalledWith(payload);
  });

  it('throws not found when updating unknown task', async () => {
    (repository.findById as any).mockResolvedValue(null);

    await expect(service.updateTaskStatus('unknown', 'done')).rejects.toMatchObject({
      status: 404,
    });
  });

  it('rejects invalid transitions', async () => {
    const task = {
      id: '1',
      title: 'Test',
      status: 'done' as TaskStatus,
      createdAt: '',
      updatedAt: '',
    };
    (repository.findById as any).mockResolvedValue(task);

    await expect(service.updateTaskStatus('1', 'pending')).rejects.toMatchObject({
      status: 409,
      code: 'INVALID_TRANSITION',
    });
  });
});
