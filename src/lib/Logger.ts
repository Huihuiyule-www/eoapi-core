import chalk from 'chalk';
import path from 'path';
import util from 'util';
import { appendFile, dateFormat } from '../utils'
import { EOInterface, LoggerInterface, LogArgvType, LogTypeEnum, LogArgvWithErrorType, UndefinableType, LogColorType } from '../types';

export class Logger implements LoggerInterface {
  /**
   * Log levels.
   */
  private readonly levels = {
    [LogTypeEnum.success]: 'green',
    [LogTypeEnum.info]: 'blue',
    [LogTypeEnum.warn]: 'yellow',
    [LogTypeEnum.error]: 'red'
  };

  /**
   * EO object.
   */
  private readonly eo: EOInterface;

  /**
   * Constructor.
   * @param eo
   */
  constructor(eo: EOInterface) {
    this.eo = eo;
  }

  /**
   * Process log messages.
   * @param type
   * @param messages
   */
  private process(type: LogTypeEnum, ...messages: LogArgvWithErrorType[]): void {
    if (!this.eo.getConfig<UndefinableType<string>>('silent')) {
      const header = chalk[this.levels[type] as LogColorType](`[Eo ${type.toUpperCase()}]:`);
      console.log(header, ...messages);
      const level: string = this.eo.getConfig('settings.log.level');
      if (this.isValidLevel(type, level)) {
        this.save(type, ...messages);
      }
    }
  }

  /**
   * Save log messages into file.
   * @param type
   * @param messages
   */
  private save(type: LogTypeEnum, ...messages: LogArgvWithErrorType[]): void {
    try {
      const fileName: string = this.eo.getConfig<UndefinableType<string>>('settings.log.fileName') || path.join(this.eo.baseDir, './eo.log');
      let output = `${dateFormat()} [EO ${type.toUpperCase()}]`;
      messages.forEach((message: LogArgvWithErrorType) => {
        if (typeof message === 'object') {
          if (LogTypeEnum.error === type) {
            message = `\n------Error Stack Begin------\n${util.format(message?.stack)}\n-------Error Stack End-------`;
          } else {
            message = JSON.stringify(message);
          }
        }
        output += `${message as string}`;
      });
      output += '\n';
      appendFile(fileName, output);
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * Validate the log level.
   * @param type
   * @param level
   */
  private isValidLevel(type: string, level: undefined | string | string[]): boolean {
    if (level === undefined || level === 'all') {
      return true;
    }
    if (Array.isArray(level)) {
      return level.some((item: string) => (item === type || item === 'all'));
    } else {
      return type === level;
    }
  }

  /**
   * Success messages.
   * @param messages
   */
  success(...messages: LogArgvType[]): void {
    return this.process(LogTypeEnum.success, ...messages);
  }

  /**
   * Info messages.
   * @param messages
   */
  info(...messages: LogArgvType[]): void {
    return this.process(LogTypeEnum.info, ...messages);
  }

  /**
   * Warning messages.
   * @param messages
   */
  warn(...messages: LogArgvType[]): void {
    return this.process(LogTypeEnum.warn, ...messages);
  }

  /**
   * Error messages.
   * @param messages
   */
  error(...messages: LogArgvWithErrorType[]): void {
    return this.process(LogTypeEnum.error, ...messages);
  }
}

export default Logger;
