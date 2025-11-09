import { performance } from 'perf_hooks';
import { IncomingMessage, ServerResponse } from 'http';

interface MetricSnapshot {
  totalRequests: number;
  successfulRequests: number;
  clientErrors: number;
  serverErrors: number;
  durations: number[];
}

const metrics: MetricSnapshot = {
  totalRequests: 0,
  successfulRequests: 0,
  clientErrors: 0,
  serverErrors: 0,
  durations: [],
};

export function collectMetrics(req: IncomingMessage, res: ServerResponse): void {
  const start = performance.now();
  metrics.totalRequests += 1;
  res.on('finish', () => {
    const duration = performance.now() - start;
    metrics.durations.push(duration);
    if (res.statusCode >= 200 && res.statusCode < 300) {
      metrics.successfulRequests += 1;
    } else if (res.statusCode >= 400 && res.statusCode < 500) {
      metrics.clientErrors += 1;
    } else if (res.statusCode >= 500) {
      metrics.serverErrors += 1;
    }
  });
}

export function getMetricsSnapshot() {
  const sorted = [...metrics.durations].sort((a, b) => a - b);
  const percentile = (p: number) => {
    if (sorted.length === 0) return 0;
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  };
  return {
    totalRequests: metrics.totalRequests,
    successfulRequests: metrics.successfulRequests,
    clientErrors: metrics.clientErrors,
    serverErrors: metrics.serverErrors,
    latencyP95: percentile(95),
  };
}
