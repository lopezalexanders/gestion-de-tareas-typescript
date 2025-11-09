import { randomUUID } from 'crypto';
import {
  CreateTaskInput,
  MAX_DESCRIPTION_LENGTH,
  MAX_TITLE_LENGTH,
  Task,
  TaskStatus,
} from '../domain/task';
import { TaskRepository } from './taskRepository';
import { escapeSqlValue, runSql } from '../utils/sqlite';

interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
}

export class SqliteTaskRepository implements TaskRepository {
  constructor(private readonly dbPath: string) {}

  async init(): Promise<void> {
    const sql = `
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL CHECK(length(title) BETWEEN 1 AND ${MAX_TITLE_LENGTH}),
        description TEXT NULL CHECK(length(description) <= ${MAX_DESCRIPTION_LENGTH}),
        status TEXT NOT NULL CHECK(status IN ('pending','in_progress','done')) DEFAULT 'pending',
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_tasks_status_created_at ON tasks(status, created_at DESC);
    `;
    await runSql({ dbPath: this.dbPath, sql });
  }

  async createTask(input: CreateTaskInput): Promise<Task> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const status = input.status ?? 'pending';
    const sql = `INSERT INTO tasks (id, title, description, status, created_at, updated_at)
      VALUES (${escapeSqlValue(id)}, ${escapeSqlValue(input.title)}, ${escapeSqlValue(
        input.description ?? null,
      )}, ${escapeSqlValue(status)}, ${escapeSqlValue(now)}, ${escapeSqlValue(now)})
      RETURNING id, title, description, status, created_at, updated_at;`;
    const rows = await runSql<TaskRow>({ dbPath: this.dbPath, sql });
    return rows[0];
  }

  async listTasks(params: {
    status?: TaskStatus;
    q?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ items: Task[]; total: number }> {
    const where: string[] = [];
    if (params.status) {
      where.push(`status = ${escapeSqlValue(params.status)}`);
    }
    if (params.q) {
      const pattern = `%${params.q.replace(/%/g, '')}%`;
      const clause = `(
        title LIKE ${escapeSqlValue(pattern)}
        OR description LIKE ${escapeSqlValue(pattern)}
      )`;
      where.push(clause);
    }
    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const limit = params.limit ?? 20;
    const offset = params.offset ?? 0;
    const sql = `
      SELECT json_group_array(json_object(
        'id', id,
        'title', title,
        'description', description,
        'status', status,
        'created_at', created_at,
        'updated_at', updated_at
      )) AS items,
      (SELECT COUNT(1) FROM tasks ${whereClause}) AS total
      FROM (
        SELECT * FROM tasks
        ${whereClause}
        ORDER BY datetime(created_at) DESC
        LIMIT ${limit} OFFSET ${offset}
      );
    `;
    const rows = await runSql<{ items: string | null; total: number }>({ dbPath: this.dbPath, sql });
    const row = rows[0];
    const items = row?.items ? (JSON.parse(row.items) as Task[]) : [];
    return { items, total: row?.total ?? 0 };
  }

  async findTaskById(id: string): Promise<Task | null> {
    const sql = `SELECT id, title, description, status, created_at, updated_at FROM tasks WHERE id = ${escapeSqlValue(
      id,
    )} LIMIT 1;`;
    const rows = await runSql<TaskRow>({ dbPath: this.dbPath, sql });
    return rows[0] ?? null;
  }

  async updateTaskStatus(id: string, status: TaskStatus): Promise<Task | null> {
    const now = new Date().toISOString();
    const sql = `UPDATE tasks SET status = ${escapeSqlValue(status)}, updated_at = ${escapeSqlValue(
      now,
    )} WHERE id = ${escapeSqlValue(id)} RETURNING id, title, description, status, created_at, updated_at;`;
    const rows = await runSql<TaskRow>({ dbPath: this.dbPath, sql });
    return rows[0] ?? null;
  }
}
