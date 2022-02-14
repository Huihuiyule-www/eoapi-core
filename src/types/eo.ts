import { EventEmitter } from 'events';
import { Command } from 'commander';
import { KeyMapInterface } from './common';
import { HookInterface } from './hook';
import { LoggerInterface } from './logger';
import { ModuleInterface } from './module';

export interface EOInterface extends EventEmitter {
  /**
   * Config path.
   */
  configPath: string;

  /**
   * Base dir of config path.
   */
  baseDir: string;

  /**
   * Logger factory
   */
  logger: LoggerInterface;

  /**
   * Commander, for cli
   */
  command: Command;

  /**
   * Inquirer
   */
  //inquirer: Inquirer;

  /**
   * Hook
   */
  hook: HookInterface;

  /**
   * After hook, the input will be output
   */
  output: any[];

  /**
   * Original data.
   */
  input: any[];

  /**
   * Module manager.
   */
  module: ModuleInterface;

  /**
   * Get config from eo.
   */
  getConfig: <T>(name?: string) => T;

  /**
   * Save config to config path.
   */
  saveConfig: (config: KeyMapInterface<any>) => void;

  /**
   * Remove some [propName] in config[key] and save into config path.
   */
  removeConfig: (key: string, propName: string) => void;

  /**
   * Set config to eo and will not save to config path.
   */
  setConfig: (config: KeyMapInterface<any>) => void;

  /**
   * Unset config to eo && will not save to config path.
   */
  unsetConfig: (key: string, propName: string) => void;

  hookDemo: () => EOInterface;
}


/**
 * Core config interface.
 */
export interface EOConfigInterface {
  database: {
    current?: string
  }
  modules: {
    [moduleName: string]: boolean
  }
  debug?: boolean
  silent?: boolean
  settings?: {
    log?: {
      level?: string
      filename?: string
    },
    registry?: string
    proxy?: string
    [others: string]: any
  }
  [configOptions: string]: any
}
