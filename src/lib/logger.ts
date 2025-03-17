type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private static instance: Logger;
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isDetailedLogs = process.env.NEXT_PUBLIC_DETAILED_LOGS === 'true';

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private log(level: LogLevel, ...args: any[]) {
    if (!this.isDevelopment && level === 'debug') return;
    
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    
    if (level === 'error') {
      console.error(prefix, ...args);
    } else if (level === 'warn') {
      console.warn(prefix, ...args);
    } else if (this.isDevelopment) {
      if (level === 'debug' && this.isDetailedLogs) {
        console.debug(prefix, ...args);
      } else if (level === 'info') {
        console.info(prefix, ...args);
      }
    }
  }

  debug(...args: any[]) {
    this.log('debug', ...args);
  }

  info(...args: any[]) {
    this.log('info', ...args);
  }

  warn(...args: any[]) {
    this.log('warn', ...args);
  }

  error(...args: any[]) {
    this.log('error', ...args);
  }
}

export const logger = Logger.getInstance(); 