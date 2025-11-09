import { performance } from 'node:perf_hooks';

import { Request, Response, NextFunction } from 'express';

export interface MetricsRecorder {
  recordRequest(durationMs: number, statusCode: number): void;
}

class InMemoryMetricsRecorder implements MetricsRecorder {
  private durations: number[] = [];
  private statusCounters: Map<number, number> = new Map();

  recordRequest(durationMs: number, statusCode: number): void {
    this.durations.push(durationMs);
    this.statusCounters.set(statusCode, (this.statusCounters.get(statusCode) ?? 0) + 1);
  }

  getSnapshot() {
    const sorted = [...this.durations].sort((a, b) => a - b);
    const p95Index = Math.floor(0.95 * (sorted.length - 1));
    return {
      count: this.durations.length,
      p95: sorted.length ? sorted[p95Index] : 0,
      statusCounters: Object.fromEntries(this.statusCounters.entries()),
    };
  }
}

export const metricsRecorder = new InMemoryMetricsRecorder();

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = performance.now();
  res.on('finish', () => {
    const duration = performance.now() - start;
    metricsRecorder.recordRequest(duration, res.statusCode);
  });
  next();
};
