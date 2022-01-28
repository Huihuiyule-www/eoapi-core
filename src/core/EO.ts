import fs from 'fs-extra';
import path from 'path';
import { EventEmitter } from 'events';
import { homedir } from 'os';
import { Command } from 'commander';
import inquirer, { Inquirer } from 'inquirer';
import Logger from '../lib/Logger';
import Hook from '../lib/Hook';
import Config from '../lib/Config';
import Module from '../lib/Module';
import Storage from '../lib/Storage';
import { EventBus } from '../lib/EventBus';
import { get, set, unset } from 'lodash';
import { EOInterface, EOConfigInterface, ModuleInterface, HookInterface, KeyMapInterface, UndefinableType, SystemEventEnum } from '../types';

export class EO extends EventEmitter implements EOInterface {
  private config!: Config;
  private _config!: EOConfigInterface;
  private _module!: ModuleInterface;
  configPath: string;
  baseDir!: string;
  logger!: Logger;
  command!: Command;
  inquirer: Inquirer;
  storage!: Storage;
  hook!: HookInterface;
  output: any[];
  input: any[];

  get module(): ModuleInterface {
    return this._module;
  }

  constructor(configPath: string = '') {
    super();
    this.configPath = configPath;
    this.output = [];
    this.input = [];
    this.initConfigPath();
    this.logger = new Logger(this);
    this.command = new Command();
    this.storage = new Storage();
    this.inquirer = inquirer;
    this.hook = new Hook();
    this.init();
  }

  private initConfigPath(): void {
    if ('' === this.configPath) {
      this.configPath = homedir() + '/.eo/config.json';
    }
    if (path.extname(this.configPath).toUpperCase() !== '.JSON') {
      this.configPath = '';
      throw Error('The configuration file only supports JSON format.')
    }
    this.baseDir = path.dirname(this.configPath);
    const exist = fs.pathExistsSync(this.configPath);
    if (!exist) {
      fs.ensureFileSync(`${this.configPath}`);
    }
  }

  private init(): void {
    this.config = new Config(this);
    this._config = this.config.getConfig();
    try {
      this._module = new Module(this);
    } catch(e) {
      this.logger.error(e as Error);
      throw e;
    }
  }

  /**
   * Load all of CLI commands.
   */
  loadAllCommands(): void {
    if ('' !== this.configPath) {
      this.hook.invokeCommands(this);
    }
  }

  getConfig<T> (name?: string): T {
    if (!name) {
      return this._config as unknown as T;
    } else {
      return get(this._config, name);
    }
  }

  saveConfig (config: KeyMapInterface<any>): void {
    if (!this.config.isValidInputConfig(config)) {
      this.logger.warn('The format of config is invalid, please provide object');
    } else {
      this.setConfig(config);
      this.config.saveConfig(config);
    }
  }

  removeConfig (key: string, propName: string): void {
    if (key && propName) {
      if (this.config.isBlackList(key)) {
        this.logger.warn(`The config.${key} can't be removed`);
      } else {
        this.unsetConfig(key, propName);
        this.config.unset(key, propName);
      }
    }
  }

  setConfig(config: KeyMapInterface<any>): void {
    if (!this.config.isValidInputConfig(config)) {
      this.logger.warn('The format of config is invalid, please provide object');
    } else {
      Object.keys(config).forEach((name: string) => {
        if (this.config.isBlackList(name)) {
          this.logger.warn(`The config.${name} can't be modified`);
          delete config[name];
        } else {
          set(this._config, name, config[name]);
          EventBus.emit(SystemEventEnum.CONFIG_CHANGE, {
            configName: name,
            value: config[name]
          });
        }
      })
    }
  }

  unsetConfig(key: string, propName: string): void {
    if (key && propName) {
      if (this.config.isBlackList(key)) {
        this.logger.warn(`The config.${key} can't be unset`);
      } else {
        unset(this.getConfig(key), propName);
      }
    }
  }

  async listTodoItems() {
    return await this.storage.project.toArray();
  }

  hookDemo(): EOInterface {
    console.log('listTodoItems');
    console.log(this.listTodoItems());
    const input = ['testa', 'testb'];
    const eo = this;
    try {
      if (!Array.isArray(input)) {
        throw new Error('Input must be an array.')
      }
      eo.input = input;
      eo.output = [];
      this.hook.invoke(eo, 'db_load');
      console.log(eo);
      return eo;
    } catch (e) {
      eo.logger.error(e as Error);
      if (eo.getConfig<UndefinableType<string>>('debug')) {
        throw e;
      }
      return eo;
    }
  }
}
