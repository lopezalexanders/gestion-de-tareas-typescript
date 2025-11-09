import { Request, Response } from 'express';

import { metricsRecorder } from '../observability/metrics.js';

export const healthController = (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    metrics: metricsRecorder.getSnapshot(),
  });
};
