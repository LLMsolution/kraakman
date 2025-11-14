// Environment-aware logging utility
// Replaces direct console statements with production-safe logging

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
}

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = import.meta.env.DEV || process.env.NODE_ENV === 'development';
  }

  private createLogEntry(level: LogLevel, message: string, context?: Record<string, any>): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    };
  }

  private formatLog(entry: LogEntry): string {
    const { level, message, timestamp, context } = entry;
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>): void {
    if (!this.isDevelopment && level !== 'error') {
      return; // Only log errors in production
    }

    const entry = this.createLogEntry(level, message, context);
    const formattedMessage = this.formatLog(entry);

    switch (level) {
      case 'debug':
        if (this.isDevelopment) console.debug(formattedMessage);
        break;
      case 'info':
        if (this.isDevelopment) console.info(formattedMessage);
        break;
      case 'warn':
        console.warn(formattedMessage);
        break;
      case 'error':
        console.error(formattedMessage);
        break;
    }
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, any>): void {
    this.log('error', message, context);
  }

  // Specialized logging methods for common scenarios
  apiCall(method: string, url: string, context?: Record<string, any>): void {
    this.debug(`API Call: ${method} ${url}`, context);
  }

  apiError(method: string, url: string, error: Error | string, context?: Record<string, any>): void {
    this.error(`API Error: ${method} ${url}`, {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      ...context
    });
  }

  userAction(action: string, context?: Record<string, any>): void {
    this.info(`User Action: ${action}`, context);
  }

  performance(operation: string, duration: number, context?: Record<string, any>): void {
    this.info(`Performance: ${operation} took ${duration}ms`, context);
  }
}

// Create singleton instance
export const logger = new Logger();

// Export individual methods for convenience
export const {
  debug,
  info,
  warn,
  error,
  apiCall,
  apiError,
  userAction,
  performance,
} = logger;