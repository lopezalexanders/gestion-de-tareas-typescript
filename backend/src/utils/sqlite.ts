import { execFile } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';

export interface SqliteRunOptions {
  dbPath: string;
  sql: string;
}

export async function runSql<T = unknown>({ dbPath, sql }: SqliteRunOptions): Promise<T[]> {
  ensureDatabaseFolder(dbPath);
  const stdout = await execFileAsync('sqlite3', ['-json', dbPath, sql]);
  const trimmed = stdout.trim();
  if (!trimmed) {
    return [];
  }
  return JSON.parse(trimmed) as T[];
}

async function execFileAsync(command: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(command, args, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr || error.message));
        return;
      }
      resolve(stdout);
    });
  });
}

function ensureDatabaseFolder(dbPath: string): void {
  const dir = dirname(dbPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

export function escapeSqlValue(value: unknown): string {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value.toString() : 'NULL';
  }
  if (typeof value === 'boolean') {
    return value ? '1' : '0';
  }
  const str = String(value).replace(/'/g, "''");
  return `'${str}'`;
}
