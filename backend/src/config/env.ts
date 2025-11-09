import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const loadEnvFile = (fileName = '.env'): void => {
  const filePath = path.resolve(process.cwd(), fileName);
  if (!existsSync(filePath)) {
    return;
  }

  const content = readFileSync(filePath, 'utf8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line.length === 0 || line.startsWith('#')) {
      continue;
    }

    const match = rawLine.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (!match) {
      continue;
    }

    const [, key, rawValue = ''] = match;
    if (process.env[key] !== undefined) {
      continue;
    }

    let value = rawValue;
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1).replace(/\\n/g, '\n');
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
    } else {
      value = value.trim().replace(/\s+#.*$/, '');
    }

    process.env[key] = value;
  }
};

loadEnvFile();

export interface AppConfig {
  port: number;
  nodeEnv: string;
  corsOrigin: string | RegExp | (string | RegExp)[];
  rateLimit: {
    max: number;
    timeWindow: number;
  };
  database: {
    client: string;
    connection: string;
  };
}

const DEFAULT_PORT = 3000;

const parsePort = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const buildCorsOrigin = (): AppConfig['corsOrigin'] => {
  const origins = process.env.CORS_ORIGIN;
  if (!origins) {
    return [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/];
  }

  const entries = origins.split(',').map((origin) => origin.trim());
  if (entries.length === 1) {
    return entries[0];
  }
  return entries;
};

export const appConfig: AppConfig = {
  port: parsePort(process.env.PORT, DEFAULT_PORT),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  corsOrigin: buildCorsOrigin(),
  rateLimit: {
    max: Number(process.env.RATE_LIMIT_MAX ?? 100),
    timeWindow: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 5 * 60 * 1000),
  },
  database: {
    client: 'sqlite3',
    connection: process.env.DATABASE_URL ?? 'file:./dev.db',
  },
};
