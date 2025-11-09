import { Request, Response } from 'express';

import { tasksService } from '../services/tasks.service.js';

export class TasksController {
  async create(req: Request, res: Response) {
    const task = await tasksService.createTask(req.body);
    res.status(201).json(task);
  }

  async list(req: Request, res: Response) {
    const { status, q, limit, offset } = req.query as any;
    const tasks = await tasksService.listTasks({
      status,
      query: q,
      limit,
      offset,
    });
    res.json(tasks);
  }

  async updateStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { status } = req.body;
    const task = await tasksService.updateTaskStatus(id, status);
    res.json(task);
  }
}

export const tasksController = new TasksController();
