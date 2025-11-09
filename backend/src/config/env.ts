import 'dotenv/config';

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
