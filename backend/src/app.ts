import 'express-async-errors';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';

import { appConfig } from './config/env.js';
import { errorHandler, notFoundHandler } from './middlewares/error.js';
import { requestIdMiddleware } from './middlewares/requestId.js';
import { metricsMiddleware } from './observability/metrics.js';
import routes from './routes/index.js';
import { logger } from './observability/logger.js';
import { createCorsMiddleware } from './middlewares/cors.js';

const app = express();

app.use(express.json());
app.use(requestIdMiddleware);
app.use(metricsMiddleware);
app.use(
  createCorsMiddleware({
    origin: appConfig.corsOrigin,
    credentials: true,
  }),
);

app.use(helmet());

app.use(
  rateLimit({
    windowMs: appConfig.rateLimit.timeWindow,
    max: appConfig.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.use(
  pinoHttp({
    logger,
    customLogLevel: (_req, res, err) => {
      if (err || res.statusCode >= 500) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    },
    genReqId: (req) => req.id ?? undefined,
  }),
);

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
