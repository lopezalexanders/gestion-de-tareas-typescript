import { nanoid } from 'nanoid';

import { db } from '../infra/db.js';
import { Task, TaskStatus } from '../domain/Task.js';

import { CreateTaskParams, FindTasksFilters, TaskRepository } from './types.js';

const mapRowToTask = (row: any): Task => ({
  id: row.id,
  title: row.title,
  description: row.description,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export class KnexTaskRepository implements TaskRepository {
  async create(params: CreateTaskParams): Promise<Task> {
    const id = nanoid();
    const now = new Date().toISOString();
    const payload = {
      id,
      title: params.title,
      description: params.description ?? null,
      status: params.status ?? 'pending',
      created_at: now,
      updated_at: now,
    };

    await db('tasks').insert(payload);
    return mapRowToTask(payload);
  }

  async findById(id: string): Promise<Task | null> {
    const row = await db('tasks').where({ id }).first();
    return row ? mapRowToTask(row) : null;
  }

  async findAll(filters: FindTasksFilters): Promise<Task[]> {
    const queryBuilder = db('tasks').select('*');

    if (filters.status) {
      queryBuilder.where({ status: filters.status });
    }

    if (filters.query) {
      const likeQuery = `%${filters.query.toLowerCase()}%`;
      queryBuilder.andWhere((builder) =>
        builder
          .whereRaw('LOWER(title) LIKE ?', [likeQuery])
          .orWhereRaw('LOWER(COALESCE(description, "")) LIKE ?', [likeQuery]),
      );
    }

    queryBuilder.orderBy('created_at', 'desc');

    if (typeof filters.limit === 'number') {
      queryBuilder.limit(filters.limit);
    }
    if (typeof filters.offset === 'number') {
      queryBuilder.offset(filters.offset);
    }

    const rows = await queryBuilder;
    return rows.map(mapRowToTask);
  }

  async updateStatus(id: string, status: TaskStatus): Promise<Task | null> {
    const now = new Date().toISOString();
    const updatedRows = await db('tasks')
      .where({ id })
      .update({ status, updated_at: now });

    if (!updatedRows) {
      return null;
    }

    const row = await db('tasks').where({ id }).first();
    return row ? mapRowToTask(row) : null;
  }
}

export const taskRepository = new KnexTaskRepository();
