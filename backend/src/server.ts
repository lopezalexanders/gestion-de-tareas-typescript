import app from './app.js';
import { appConfig } from './config/env.js';
import { logger } from './observability/logger.js';

const server = app.listen(appConfig.port, () => {
  logger.info({ event: 'server_started', port: appConfig.port }, 'Server listening');
});

const shutdown = () => {
  logger.info('Shutting down');
  server.close(() => process.exit(0));
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
