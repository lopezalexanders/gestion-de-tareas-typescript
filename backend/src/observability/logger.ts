export type LogLevel = 'info' | 'warn' | 'error';

export interface LogContext {
  requestId?: string;
  userId?: string;
  [key: string]: unknown;
}

function log(level: LogLevel, message: string, context: LogContext = {}): void {
  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...context,
  };
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(payload));
}

export const logger = {
  info(message: string, context?: LogContext) {
    log('info', message, context);
  },
  warn(message: string, context?: LogContext) {
    log('warn', message, context);
  },
  error(message: string, context?: LogContext) {
    log('error', message, context);
  },
};
