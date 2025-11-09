import pino from 'pino';

import { appConfig } from '../config/env.js';

const isProduction = appConfig.nodeEnv === 'production';

export const logger = pino({
  level: isProduction ? 'info' : 'debug',
});
