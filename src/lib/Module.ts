import fs from 'fs-extra';
import path from 'path';
import spawn from 'cross-spawn'
import resolve from 'resolve';
import { EOInterface, ModuleInterface, ModuleType, EOModuleInterface, ModuleEnvInterface, ModuleOptionsInterface, ModuleResultInterface, ModuleProcessResultInterface, ResultInterface, UndefinableType, EOEventEnum } from '../types';
import systemModule from '../modules/system';
import databaseModule from '../modules/database';

export class Module implements ModuleInterface {
  private readonly eo: EOInterface;
  private readonly modules: Map<string, EOModuleInterface>;
  private readonly enabledModules: Map<string, EOModuleInterface>;
  private readonly disabledModules: Map<string, EOModuleInterface>;
  private readonly packagePath: string;
  private readonly modulePath: string;

  constructor (eo: EOInterface) {
    this.eo = eo;
    this.modules = new Map();
    this.enabledModules = new Map();
    this.disabledModules = new Map();
    this.packagePath = path.join(eo.baseDir, 'package.json');
    this.modulePath = path.join(eo.baseDir, 'node_modules');
    this.init();
  }

  private init(): void {
    if (!fs.existsSync(this.packagePath)) {
      const data = {
        name: 'eoapi-core',
        description: 'eoapi-core',
        repository: 'https://github.com/eolinker/eoapi-core',
        license: 'Apache-2.0 License',
        dependencies: {
          'eo-module-test': '1.0.0'
        }
      };
      fs.writeFileSync(this.packagePath, JSON.stringify(data), 'utf8');
    }
    this.loadModules();
  }

  /**
   * Get module entry.
   */
  private resolve(eo: EOInterface, name: string): string {
    try {
      return resolve.sync(name, { basedir: eo.baseDir });
    } catch (err) {
      return path.join(this.modulePath, name);
    }
  }

  /**
   * Load modules.
   */
  private loadModules() {
    this.loadContributedModules();
    this.loadCommunityModules();
  }

  /**
   * Load contributed modules.
   */
  private loadContributedModules(): boolean {
    const modules: EOModuleInterface[] = [];
    modules.push(systemModule());
    modules.push(databaseModule());
    modules.forEach((module: EOModuleInterface) => {
      this.enableModule(module);
    });
    return true;
  }

  /**
   * Load community modules.
   */
  private loadCommunityModules(): boolean {
    if (!fs.existsSync(this.modulePath)) {
      return false;
    }
    const json = fs.readJSONSync(this.packagePath);
    const deps = Object.keys(json.dependencies || {});
    const devDeps = Object.keys(json.devDependencies || {});
    const modules = deps.concat(devDeps).filter((name: string) => {
      if (!/^eo-module-|^@[^/]+\/eo-module-/.test(name)) {
        return false;
      }
      return fs.existsSync(this.resolve(this.eo, name));
    });
    for (const name of modules) {
      const module = require(path.join(this.modulePath, name))();
      this.enableModule(module);
    }
    return true;
  }

  /**
   * Enable module, save config & trigger hooks bind.
   * @param module
   */
  private enableModule(module: EOModuleInterface): void {
    this.modules.set(module.id, module);
    try {
      const configKey = `modules.${module.id}`;
      let enabled = this.eo.getConfig(configKey);
      // Run install method when first register.
      if (enabled === undefined) {
        if (typeof module['install'] === 'function') {
          module['install'](this.eo);
        }
        enabled = true;
        this.eo.saveConfig({[configKey]: enabled});
      }
      if (enabled === true) {
        this.enabledModules.set(module.id, module);
        this.eo.hook.bind(module);
      } else {
        this.disableModule(module);
      }
    } catch(e) {
      this.eo.logger.error(e as Error);
      this.disableModule(module);
      this.eo.emit(EOEventEnum.NOTIFICATION, { title: `Module ${module.name} load error`, body: e });
    }
  }

  /**
   * Disable module.
   * @param module
   */
  private disableModule(module: EOModuleInterface): void {
    this.eo.hook.unbind(module);
    this.disabledModules.set(module.id, module);
    if (this.enabledModules.has(module.id)) {
      this.enabledModules.delete(module.id);
    }
    try {
      const configKey = `modules.${module.id}`;
      this.eo.saveConfig({[configKey]: false});
    } catch(e) {
      this.eo.logger.error(e as Error);
    }
  }

  /**
   * Register module.
   * @param moduleID
   */
  private register(moduleID: string): void {
    try {
      const module = require(path.join(this.modulePath, moduleID))();
      this.enableModule(module);
    } catch (e) {
      this.eo.logger.error(e as Error);
    }
  }

  /**
   * Unregister module.
   * @param moduleID
   */
  private unregister(moduleID: string): void {
    const module = this.get(moduleID);
    if (module) {
      this.eo.removeConfig('modules', module.id);
      this.eo.hook.unbind(module);
      if (this.modules.has(module.id)) {
        this.modules.delete(module.id);
      }
      if (this.enabledModules.has(module.id)) {
        this.enabledModules.delete(module.id);
      }
      if (this.disabledModules.has(module.id)) {
        this.disabledModules.delete(module.id);
      }
      // add event notify.
    }
  }

  /**
   * Get module by module id.
   */
  get(moduleID: string): EOModuleInterface | undefined {
    return this.modules.get(moduleID);
  }

  /**
   * Check if module exists.
   * @param moduleID
   */
  has(moduleID: string): boolean {
    return this.modules.has(moduleID);
  }

  /**
   * Get all of the modules.
   */
  getModules(): Map<string, EOModuleInterface> {
    return this.modules;
  }

  /**
   * Get enabled module with module id.
   * @param moduleID
   */
  getEnableModule(moduleID: string): EOModuleInterface | undefined {
    return this.enabledModules.get(moduleID);
  }

  /**
   * Get all of the enabled modules.
   */
  getEnabledModules(): Map<string, EOModuleInterface> {
    return this.enabledModules;
  }

  /**
   * Check if enabled module exists.
   * @param moduleID
   */
  hasEnabledModule(moduleID: string): boolean {
    return this.enabledModules.has(moduleID);
  }

  /**
   * Get all of the disabled modules.
   */
  getDisabledModules(): Map<string, EOModuleInterface> {
    return this.disabledModules;
  }

  /**
   * Get module type with name.
   * @param name
   */
  private getModuleType(name: string): ModuleType {
    let output: ModuleType = 'unknown';
    if (/^@[^/]+\/eo-module-/.test(name)) {
      output = 'scope';
    } else if (name.startsWith('eo-module-')) {
      output = 'normal';
    } else if (!path.isAbsolute(name) || !fs.existsSync(path.join(process.cwd(), name)) || !(name.includes('/') || name.includes('\\'))) {
      output = 'simple';
    }
    return output;
  }

  /**
   * Convert module name to full name.
   * 1. xxx -> eo-module-xxx
   * 2. xxx -> @scope/eo-module-xxx
   * @param name module simple name
   * @param scope module scope
   */
  private getCompleteModuleName(name: string, scope?: string): string {
    return scope? `@${scope}/eo-module-${name}` : `eo-module-${name}`;
  }

  /**
   * Remove module version.
   * 1. eo-module-xxx@1.0.0 -> eo-module-xxx
   * 2. @xxx/eo-module-xxx@1.0.0 -> @xxx/eo-module-xxx
   * @param name
   * @param scope
   */
  private removeModuleVersion(name: string, scope: boolean = false): string {
    if (name.includes('@')) {
      const match = name.match(scope ? /(.+\/)?(^@[^/]+\/eo-module-\w+)(@.+)*/ : /(.+\/)?(eo-module-\w+)(@.+)*/);
      if (match) {
        name = match[2];
      } else {
        this.eo.logger.warn('Can not remove module version');
      }
    }
    return name;
  }

  /**
   * handle install/uninstall/update module name or path
   * for example
   * 1. eo-module-xxx -> eo-module-xxx
   * 2. @xxx/eo-module-xxx -> @xxx/eo-module-xxx
   * 3. xxx -> eo-module-xxx
   * 4. ./xxxx/eo-module-xxx -> /absolutePath/.../xxxx/eo-module-xxx
   * 5. /absolutePath/.../eo-module-xxx -> /absolutePath/.../eo-module-xxx
   * @param nameOrPath moduleName or modulePath
   */
  private getProcessModuleName(name: string): string {
    let output: string = '';
    const moduleType = this.getModuleType(name);
    switch (moduleType) {
      case 'normal':
      case 'scope':
        output = name;
      case 'simple':
        output = this.getCompleteModuleName(name);
      default: {
        // Absolute path
        if (path.isAbsolute(name) && fs.existsSync(name)) {
          output = name;
        } else {
          // Relative path
          name = path.join(process.cwd(), name);
          if (fs.existsSync(name)) {
            output = name;
          }
        }
        if (output) {
          output = output.split(path.sep).join('/');
        } else {
          this.eo.logger.warn(`Can't find module ${name}`);
        }
      }
    }
    return output;
  }

  /**
   * Get the normal module name.
   * 1. eo-module-xxx -> eo-module-xxx
   * 2. @xxx/eo-module-xxx -> @xxx/eo-module-xxx
   * 3. ./xxxx/eo-module-xxx -> eo-module-xxx
   * 4. /absolutePath/.../eo-module-xxx -> eo-module-xxx
   * 5. an exception: [package.json's name] !== [folder name]
   * then use [package.json's name], usually match the scope package.
   * 6. if module name has version: eo-module-xxx@x.x.x then remove the version
   * @param name
   */
  private getNormalModuleName(name: string): string {
    let output: string = '';
    const moduleType = this.getModuleType(name);
    switch (moduleType) {
      case 'normal':
        output = this.removeModuleVersion(name);
      case 'scope':
        output = this.removeModuleVersion(name, true);
      case 'simple':
        output = this.removeModuleVersion(this.getCompleteModuleName(name));
      default: {
        if (!fs.existsSync(name)) {
          this.eo.logger.warn(`Can't find module: ${name}`);
        }
        const packageJson = path.posix.join(name, 'package.json');
        if (!fs.existsSync(packageJson)) {
          this.eo.logger.warn(`Can't find module: ${name}`);
        } else {
          const pkg = fs.readJSONSync(packageJson) || {};
          if (!pkg.name?.includes('eo-module-')) {
            this.eo.logger.warn(`The module package.json's name filed is ${pkg.name as string || 'empty'}, need to include the prefix: eo-module-`);
          } else {
            output = pkg.name;
          }
        }
      }
    }
    return output;
  }

  /**
   * Transform the input module name or path string to valid result.
   * @param name
   */
  private getModuleProcessResult(name: string): ModuleProcessResultInterface {
    const output: ModuleProcessResultInterface = {
      success: false,
      name: '',
      fullName: ''
    };
    output.fullName = this.getProcessModuleName(name);
    if (output.fullName) {
      output.name = this.getNormalModuleName(output.fullName);
      if (output.name) {
        output.success = true;
      }
    }
    return output;
  }

  /**
   * Run npm command to manager modules.
   * @param command
   * @param modules
   * @param path
   * @param options
   * @param env
   */
  private async execCommand(command: string, modules: string[], path: string, options: ModuleOptionsInterface = {}, env: ModuleEnvInterface = {}): Promise<ResultInterface> {
    const registry = options.registry || this.eo.getConfig<UndefinableType<string>>('settings.registry')
    const proxy = options.proxy || this.eo.getConfig<UndefinableType<string>>('settings.proxy')
    return await new Promise((resolve: any): void => {
      let args = [command].concat(modules).concat('--color=always').concat('--save');
      if (registry) {
        args = args.concat(`--registry=${registry}`);
      }
      if (proxy) {
        args = args.concat(`--proxy=${proxy}`);
      }
      try {
        const npm = spawn('npm', args, { cwd: path, env: Object.assign({}, process.env, env) });
        let output = '';
        npm.stdout.on('data', (data: string) => {
          output += data;
        }).pipe(process.stdout);
        npm.stderr.on('data', (data: string) => {
          output += data;
        }).pipe(process.stderr);
        npm.on('close', (code: number) => {
          if (!code) {
            resolve({ code: 0, data: output });
          } else {
            resolve({ code: code, data: output });
          }
        });
        // for users who haven't installed node
        npm.on('error', (err: Error) => {
          this.eo.logger.error(err);
          this.eo.logger.error('NPM is not installed');
          this.eo.emit(EOEventEnum.FAILED, 'NPM is not installed');
        });
      } catch(e) {
        this.eo.logger.error(e as Error);
        this.eo.emit(EOEventEnum.FAILED, e);
      }
    })
  }

  /**
   * Install modules.
   * @param modules
   * @param options
   * @param env
   */
  async install(modules: string[], options: ModuleOptionsInterface = {}, env?: ModuleEnvInterface): Promise<ModuleResultInterface<boolean>> {
    const installedModules: string[] = [];
    const processModules = modules
      .map((item: string) => this.getModuleProcessResult(item))
      .filter((item) => {
        // Detect if has already installed or will cause error.
        if (this.has(item.name)) {
          installedModules.push(item.name);
          this.eo.logger.success(`Module ${item.name} already installed.`);
          return false;
        }
        return item.success;
      });
    const fullNameList = processModules.map(item => item.fullName);
    const nameList = processModules.map(item => item.name);
    let success: boolean = false;
    let title: string = 'Module install success.';
    let message: string = 'Module install success.';
    let body: string | string[];
    if (fullNameList.length > 0) {
      const result = await this.execCommand('install', fullNameList, this.eo.baseDir, options, env);
      if (!result.code) {
        nameList.forEach((name: string) => this.register(name));
        success = true;
        body = [...nameList, ...installedModules];
      } else {
        title = 'Module install failed.';
        message = `Module install failed, status code: ${result.code}, message: \n${result.data}`;
        body = message;
      }
    } else if (installedModules.length === 0) {
      title = 'Module install failed.';
      message = 'Module install failed, please type valid module name.';
      body = message;
    } else {
      success = true;
      body = [...nameList, ...installedModules];
    }
    if (success) {
      this.eo.logger.success(message);
      this.eo.emit(EOEventEnum.MODULE_INSTALL_SUCCESS, { title: title, body: body });
    } else {
      this.eo.logger.error(message);
      this.eo.emit(EOEventEnum.MODULE_INSTALL_FAILED, { title: title, body: body });
    }
    return { success: success, body: body };
  }

  /**
   * Uninstall modules.
   * @param modules
   */
  async uninstall(modules: string[]): Promise<ModuleResultInterface<boolean>> {
    const processModules = modules.map((item: string) => this.getModuleProcessResult(item)).filter(item => item.success);
    const nameList = processModules.map(item => item.name);
    let success: boolean = false;
    let title: string = 'Module uninstall failed.';
    let message: string = '';
    let body: string | string[];
    if (nameList.length > 0) {
      const result = await this.execCommand('uninstall', nameList, this.eo.baseDir);
      if (!result.code) {
        nameList.forEach((name: string) => this.unregister(name));
        success = true;
        title = 'Module uninstall success.';
        message = title;
        body = nameList;
      } else {
        message = `Module uninstall failed, status code: ${result.code}, message: \n${result.data}`;
        body = message;
      }
    } else {
      message = 'Module uninstall failed, please type valid module name.';
      body = message;
    }
    if (success) {
      this.eo.logger.success(message);
      this.eo.emit(EOEventEnum.MODULE_UNINSTALL_SUCCESS, { title: title, body: body });
    } else {
      this.eo.logger.error(message);
      this.eo.emit(EOEventEnum.MODULE_UNINSTALL_FAILED, { title: title, body: body });
    }
    return { success: success, body: body };
  }

  /**
   * Upgrade module.
   * @param modules
   * @param options
   * @param env
   */
  async upgrade (modules: string[], options: ModuleOptionsInterface = {}, env?: ModuleEnvInterface): Promise<ModuleResultInterface<boolean>> {
    const processModules = modules.map((item: string) => this.getModuleProcessResult(item)).filter(item => item.success);
    const nameList = processModules.map(item => item.name);
    let success: boolean = false;
    let title: string = 'Module upgrade failed.';
    let message: string = '';
    let body: string | string[];
    if (nameList.length > 0) {
      const result = await this.execCommand('update', nameList, this.eo.baseDir, options, env);
      if (!result.code) {
        success = true;
        title = 'Module upgrade success.';
        message = title;
        body = nameList;
      } else {
        message = `Module upgrade failed, status code: ${result.code} message: \n${result.data}`;
        body = message;
      }
    } else {
      message = 'Module upgrade failed, please type valid module name';
      body = message;
    }
    if (success) {
      this.eo.logger.success(message);
      this.eo.emit(EOEventEnum.MODULE_UPGRADE_SUCCESS, { title: title, body: body });
    } else {
      this.eo.logger.error(message);
      this.eo.emit(EOEventEnum.MODULE_UPGRADE_FAILED, { title: title, body: body });
    }
    return { success: success, body: body };
  }

  /**
   * Enable modules.
   * @param modules
   */
  async enable(modules: string[]): Promise<ModuleResultInterface<boolean>> {
    const successModules: string[] = [];
    const failedModules: string[] = [];
    modules.forEach(moduleID => {
      const module = this.get(moduleID);
      if (module) {
        this.enableModule(module);
        successModules.push(moduleID);
      } else {
        failedModules.push(moduleID);
      }
    });
    if (successModules.length > 0) {
      this.eo.logger.success('Enable success modules: ' + successModules.join(','));
    }
    if (failedModules.length > 0) {
      this.eo.logger.success('Enable failed modules: ' + failedModules.join(','));
    }
    const output: ModuleResultInterface<true> = { success: true, body: [...successModules, ...failedModules] };
    return output;
  }

  /**
   * Disable modules.
   * @param modules
   */
  async disable(modules: string[]): Promise<ModuleResultInterface<boolean>> {
    const successModules: string[] = [];
    const failedModules: string[] = [];
    modules.forEach(moduleID => {
      const module = this.getEnableModule(moduleID);
      if (module) {
        this.disableModule(module);
        successModules.push(moduleID);
      } else {
        failedModules.push(moduleID);
      }
    });
    if (successModules.length > 0) {
      this.eo.logger.success('Disable success modules: ' + successModules.join(','));
    }
    if (failedModules.length > 0) {
      this.eo.logger.success('Disable failed modules: ' + failedModules.join(','));
    }
    const output: ModuleResultInterface<true> = { success: true, body: [...successModules, ...failedModules] };
    return output;
  }
}

export default Module;
