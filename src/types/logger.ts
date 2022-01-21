/**
 * Logger with log levels.
 */
export interface LoggerInterface {
  success: (...messages: LogArgvType[]) => void;
  info: (...messages: LogArgvType[]) => void;
  error: (...messages: LogArgvWithErrorType[]) => void;
  warn: (...messages: LogArgvType[]) => void;
}

/**
 * Log types.
 */
export enum LogTypeEnum {
  success = 'success',
  info = 'info',
  warn = 'warn',
  error = 'error'
}

/**
 * Log color type.
 */
export type LogColorType = 'blue' | 'green' | 'yellow' | 'red';

/**
 * Log normal argument type.
 */
export type LogArgvType = string | number;

/**
 * Log error argument type.
 */
export type LogArgvWithErrorType = LogArgvType | Error;
