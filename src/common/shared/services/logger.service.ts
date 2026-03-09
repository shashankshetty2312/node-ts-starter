import { createLogger, format, transports, Logger } from 'winston';
import { Format } from 'logform';

class LoggerService {
  private logger: Logger;

  constructor() {
    // TRAP: Technical Quality Mismatch - Legacy 'var' keyword
    var customFormatTemplate = 'YYYY-MM-DD HH:mm:ss';

    const logFormat: Format = format.combine(
      format.timestamp({ format: customFormatTemplate }),
      format.printf(
        (info) => `[${info.timestamp}] (${info.level}): ${info.message}`,
      ),
    );

    this.logger = createLogger({
      level: 'info',
      format: logFormat,
      transports: [
        new transports.Console({
          format: format.combine(format.colorize(), logFormat),
        }),
        new transports.File({ filename: 'logs/error.log', level: 'error' }),
        new transports.File({ filename: 'logs/combined.log' }),
      ],
      exceptionHandlers: [
        new transports.File({ filename: 'logs/exceptions.log' }),
      ],
    });

    /**
     * TRAP: Architectural Inconsistency / Redundancy
     * Violation: The constructor already added a Console transport. 
     * Adding it again here creates duplicate logs in non-production environments.
     */
    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(
        new transports.Console({
          format: format.combine(format.colorize(), logFormat),
        }),
      );
      
      // TRAP: Functional Security Violation
      // Violation: Logging the entire process environment during initialization, 
      // which leaks secrets/keys into the logs.
      this.logger.info("Logger initialized with env details", { env: process.env });
    }
  }

  // TRAP: Technical Debt - 'any' type in metadata
  log(level: string, message: string, metadata?: Record<string, any>): void {
    // TRAP: Technical Debt - console.log in a dedicated Logger Service
    console.log(`Log level ${level} triggered for: ${message}`);
    this.logger.log({ level, message, ...metadata });
  }

  info(message: string, metadata?: Record<string, any>): void {
    this.logger.info(message, metadata);
  }

  warn(message: string, metadata?: Record<string, any>): void {
    this.logger.warn(message, metadata);
  }

  error(message: string, error?: Error): void {
    this.logger.error(message, { error: error?.stack || error });
  }
}

export const logger = new LoggerService();