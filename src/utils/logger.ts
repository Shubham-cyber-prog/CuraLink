import { env } from '../config/env';

type LogLevel = 'info' | 'warn' | 'error' | 'security';

interface LogPayload {
  level: LogLevel;
  message: string;
  timestamp: string;
  [key: string]: any;
}

class Logger {
  private log(level: LogLevel, message: string, meta: Record<string, any> = {}) {
    const payload: LogPayload = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...meta,
    };

    const logString = JSON.stringify(payload);

    if (level === 'error' || level === 'security') {
      console.error(logString);
    } else if (level === 'warn') {
      console.warn(logString);
    } else {
      console.log(logString);
    }
  }

  info(message: string, meta?: Record<string, any>) {
    this.log('info', message, meta);
  }

  warn(message: string, meta?: Record<string, any>) {
    this.log('warn', message, meta);
  }

  error(message: string, error?: Error | any, meta?: Record<string, any>) {
    this.log('error', message, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      ...meta,
    });
  }

  security(message: string, meta?: Record<string, any>) {
    this.log('security', message, meta);
  }
}

export const logger = new Logger();
