import lowdb from 'lowdb';
import lodashId from 'lodash-id';
import FileSync from 'lowdb/adapters/FileSync';
import { EOConfigInterface, EOInterface } from '../types';

class Config {
  private readonly eo: EOInterface;
  private readonly db: lowdb.LowdbSync<any>;
  private readonly blackList: string[] = [];
  constructor (eo: EOInterface) {
    this.eo = eo;
    const adapter = new FileSync(this.eo.configPath, {
      serialize (obj: object): string {
        return JSON.stringify(obj, null, 2);
      },
      deserialize: JSON.parse
    });
    this.db = lowdb(adapter);
    this.db._.mixin(lodashId);

    if (!this.db.has('modules').value()) {
      try {
        this.db.set('modules', {}).write();
      } catch (e) {
        this.eo.logger.error(e as Error);
        throw e;
      }
    }
  }

  read(): any {
    return this.db.read();
  }

  get(key: string = ''): any {
    return this.read().get(key).value();
  }

  set(key: string, value: any): void {
    return this.read().set(key, value).write();
  }

  has(key: string): boolean {
    return this.read().has(key).value();
  }

  unset(key: string, value: any): boolean {
    return this.read().get(key).unset(value).write();
  }

  saveConfig(config: Partial<EOConfigInterface>): void {
    Object.keys(config).forEach((name: string) => {
      this.set(name, config[name]);
    });
  }

  removeConfig(config: EOConfigInterface): void {
    Object.keys(config).forEach((name: string) => {
      this.unset(name, config[name]);
    });
  }

  getConfig(): EOConfigInterface {
    return this.read().value();
  }

  /**
   * Check some config key is in blackList.
   * @param key
   */
  isBlackList(key: string): boolean {
    return this.blackList.some(item => key.startsWith(item));
  }

  /**
   * Check the input config is valid
   * config must be object such as { xxx: 'xxx' }
   * && can't be array
   * @param config
   */
  isValidInputConfig(config: any): boolean {
    return typeof config === 'object' && !Array.isArray(config) && Object.keys(config).length > 0;
  }
}

export default Config;
