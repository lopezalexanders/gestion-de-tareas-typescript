import { createServer, IncomingMessage, ServerResponse } from 'http';
import { parse } from 'url';
import { TaskService } from './services/taskService';
import { SqliteTaskRepository } from './repositories/sqliteTaskRepository';
import { TasksController } from './controllers/tasksController';
import { HttpRequest, parseJsonBody, sendJson } from './utils/http';
import { checkAuth } from './middlewares/auth';
import { attachRequestId } from './observability/requestId';
import { collectMetrics, getMetricsSnapshot } from './observability/metrics';
import { logger } from './observability/logger';

const PORT = Number(process.env.PORT ?? 3000);
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? 'http://localhost:5173';
const DB_PATH = process.env.DB_PATH ?? `${process.cwd()}/data/devpro-tasks.sqlite`;

const repository = new SqliteTaskRepository(DB_PATH);
const service = new TaskService(repository);
const controller = new TasksController(service);

const rateLimitStore = new Map<string, { count: number; expiresAt: number }>();
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX ?? 100);
const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 5 * 60 * 1000);

async function bootstrap() {
  await repository.init();
  const server = createServer(async (req, res) => {
    attachRequestId(req, res);
    collectMetrics(req, res);
    applySecurityHeaders(res);
    handleCors(req, res);

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    if (!enforceRateLimit(req, res)) {
      return;
    }

    try {
      await routeRequest(req, res);
    } catch (error) {
      logger.error('unhandled_error', { error: error as Error });
      sendJson(res, 500, { code: 'INTERNAL_ERROR', message: 'Unexpected error' });
    }
  });

  server.listen(PORT, () => {
    logger.info('server.started', { port: PORT });
  });
}

function applySecurityHeaders(res: ServerResponse): void {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
}

function handleCors(req: IncomingMessage, res: ServerResponse): void {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Request-Id');
}

function enforceRateLimit(req: IncomingMessage, res: ServerResponse): boolean {
  const ip = (req.socket.remoteAddress ?? 'unknown').toString();
  const now = Date.now();
  const entry = rateLimitStore.get(ip);
  if (!entry || entry.expiresAt < now) {
    rateLimitStore.set(ip, { count: 1, expiresAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  entry.count += 1;
  if (entry.count > RATE_LIMIT_MAX) {
    sendJson(res, 429, { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests' });
    return false;
  }
  return true;
}

async function routeRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const { pathname, query } = parse(req.url ?? '', true);
  const httpReq = req as HttpRequest;
  const normalizedQuery: Record<string, string> = {};
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      if (value.length > 0) {
        normalizedQuery[key] = value[0];
      }
    } else if (typeof value === 'string') {
      normalizedQuery[key] = value;
    }
  });
  httpReq.query = normalizedQuery;

  if (pathname === '/health' && req.method === 'GET') {
    sendJson(res, 200, { status: 'ok' });
    return;
  }

  if (pathname === '/metrics' && req.method === 'GET') {
    sendJson(res, 200, getMetricsSnapshot());
    return;
  }

  if (pathname === '/tasks' && req.method === 'GET') {
    checkAuth(httpReq);
    await controller.listTasks(httpReq, res);
    return;
  }

  if (pathname === '/tasks' && req.method === 'POST') {
    checkAuth(httpReq);
    httpReq.body = await parseJsonBody(req);
    await controller.createTask(httpReq, res);
    return;
  }

  const statusMatch = pathname?.match(/^\/tasks\/(.+)\/status$/);
  if (statusMatch && req.method === 'PUT') {
    checkAuth(httpReq);
    httpReq.params = { id: statusMatch[1] };
    httpReq.body = await parseJsonBody(req);
    await controller.updateTaskStatus(httpReq, res);
    return;
  }

  sendJson(res, 404, { code: 'NOT_FOUND', message: 'Route not found' });
}

bootstrap().catch((error) => {
  logger.error('bootstrap_failed', { error });
  process.exit(1);
});
