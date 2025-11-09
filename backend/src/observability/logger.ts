import pino from 'pino';

import { appConfig } from '../config/env.js';

export const logger = pino({
  level: appConfig.nodeEnv === 'production' ? 'info' : 'debug',
  transport:
    appConfig.nodeEnv === 'production'
      ? undefined
      : {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
          },
        },
});
