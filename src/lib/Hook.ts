import { EOInterface, EOModuleInterface, HookInterface } from '../types'

export class Hook implements HookInterface {
  /**
   * Prefix of cli hook function.
   */
  public static readonly CLI_PREFIX: string = 'cli__';

  /**
   * Prefix of app hook function.
   */
  public static readonly APP_PREFIX: string = 'app__';

  /**
   * Prefix of app async hook function.
   */
  public static readonly APP_ASYNC_PREFIX: string = 'app_async__';

  /**
   * Split character between module id and hook function name.
   */
  public static readonly MODULE_SPLIT: string = ':';

  /**
   * Hooks map, storage all hooks.
   */
  private readonly hooks: Set<string>;

  constructor () {
    this.hooks = new Set();
  }

  /**
   * Bind all of the hooks of a module.
   * @param module
   */
  bind(module: EOModuleInterface): void {
    Object.getOwnPropertyNames(module).filter((name: string) => {
      return (0 === name.indexOf(Hook.CLI_PREFIX) || 0 === name.indexOf(Hook.APP_PREFIX) || 0 === name.indexOf(Hook.APP_ASYNC_PREFIX)) && (typeof module[name] === 'function');
    }).forEach((name: string) => {
      const key = module.id + Hook.MODULE_SPLIT + name;
      if (this.hooks.has(key)) {
        throw new TypeError(`Hook name ${key} already exist!`);
      }
      this.hooks.add(key);
    });
  }

  /**
   * Unbind all of the hooks of a module by module id.
   * @param module
   */
  unbind(module: EOModuleInterface): void {
    const index: string = module.id + Hook.MODULE_SPLIT;
    this.hooks.forEach((hook: string) => {
      if (hook.indexOf(index) === 0) {
        this.hooks.delete(hook);
      }
    });
  }

  /**
   * Only get all of the command hooks.
   * @param name
   */
  private getCliHooks(name?: string): string[] {
    const index: string = name ? Hook.MODULE_SPLIT + Hook.CLI_PREFIX + name : Hook.MODULE_SPLIT  + Hook.CLI_PREFIX;
    return this.getHooks(index);
  }

  /**
   * Only get all of the app hooks.
   * @param name
   */
  private getAppHooks(name?: string): string[] {
    const index: string = name ? Hook.MODULE_SPLIT + Hook.APP_PREFIX + name : Hook.MODULE_SPLIT + Hook.APP_PREFIX;
    return this.getHooks(index);
  }

  /**
   * Only get all of the app async hooks.
   * @param name
   */
  private getAppAsyncHooks(name?: string): string[] {
    const index: string = name ? Hook.MODULE_SPLIT + Hook.APP_ASYNC_PREFIX + name : Hook.MODULE_SPLIT + Hook.APP_ASYNC_PREFIX;
    return this.getHooks(index);
  }

  /**
   * Get all of the hooks with prefix condition.
   * @param index
   */
  private getHooks(index: string): string[] {
    const output: string[] = [];
    this.hooks.forEach((hook: string) => {
      if (hook.indexOf(index) >= 0) {
        output.push(hook);
      }
    });
    return output;
  }

  /**
   * Invoke all of the hooks with hook keys.
   * @param hooks
   * @param eo
   */
  private invokeHooks(hooks: string[], eo: EOInterface): EOInterface {
    hooks.forEach((hookName: string, index: number) => {
      const names = hookName.split(Hook.MODULE_SPLIT);
      if (names[0] && names[1]) {
        const module = eo.module.getEnableModule(names[0]);
        if (module) {
          try {
            eo.logger.info(`${hookName}: ${index} running`);
            module[names[1]](eo);
          } catch (e) {
            eo.logger.error(`${hookName}: ${index} error`);
            throw e;
          }
        }
      }
    });
    return eo;
  }

  /**
   * Invoke all of the command hooks.
   * @param eo
   * @param hookName
   */
  invokeCommands(eo: EOInterface, hookName?: string): EOInterface {
    return this.invokeHooks(this.getCliHooks(hookName), eo);
  }

  /**
   * Invoke all of the app hooks which match the hook name.
   * @param eo
   * @param hookName
   */
  invoke(eo: EOInterface, hookName: string): EOInterface {
    return this.invokeHooks(this.getAppHooks(hookName), eo);
  }

  /**
   * Invoke all of the app async hooks which match the hook name.
   * @param eo
   * @param hookName
   */
  async invokePromise(eo: EOInterface, hookName: string): Promise<EOInterface> {
    const hooks = this.getAppAsyncHooks(hookName);
    if (hooks) {
      await Promise.all(hooks.map(async (hookName: string, index: number) => {
        const names = hookName.split(Hook.MODULE_SPLIT);
        if (names[0] && names[1]) {
          const module = eo.module.getEnableModule(names[0]);
          if (module) {
            try {
              eo.logger.info(`${hookName}: ${index} running`);
              await module[names[1]](eo);
            } catch (e) {
              eo.logger.error(`${hookName}: ${index} error`);
              throw e;
            }
          }
        }
      }));
    }
    return eo;
  }
}

export default Hook;
