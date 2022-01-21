import { UndefinableType } from './common';
import { EOInterface } from './eo';

/**
 * Module interface.
 */
export interface EOModuleInterface {
  id: string;
  core: string;
  name: string;
  version: string;
  description?: string;
  dependencies?: string[];
  package?: string;
  install?: (eo: EOInterface) => EOInterface;
  uninstall?: (eo: EOInterface) => EOInterface;
  config?: (eo: EOInterface) => EOInterface;
  [prop: string]: any;
}

/**
 * Module manager interface.
 */
export interface ModuleInterface {
  get: (moduleID: string) => EOModuleInterface | undefined;
  has: (moduleID: string) => boolean;
  getModules: () => Map<string, EOModuleInterface>;
  getEnableModule: (moduleID: string) => EOModuleInterface | undefined;
  hasEnabledModule: (moduleID: string) => boolean;
  getEnabledModules: () => Map<string, EOModuleInterface>;
  getDisabledModules: () => Map<string, EOModuleInterface>;
  install: (modules: string[], options: ModuleOptionsInterface, env?: ModuleEnvInterface) => Promise<ModuleResultInterface<boolean>>;
  upgrade: (modules: string[], options: ModuleOptionsInterface, env?: ModuleEnvInterface) => Promise<ModuleResultInterface<boolean>>;
  uninstall: (modules: string[]) => Promise<ModuleResultInterface<boolean>>;
  enable: (modules: string[]) => Promise<ModuleResultInterface<boolean>>;
  disable: (modules: string[]) => Promise<ModuleResultInterface<boolean>>;
}

/**
 * Module install command environment variable.
 */
export interface ModuleEnvInterface {
  [propName: string]: UndefinableType<string>;
}

/**
 * Module result interface.
 */
export interface ModuleResultInterface<T> {
  success: T;
  body: T extends true ? string[] : string;
}

/**
 * Module process result interface.
 */
export interface ModuleProcessResultInterface {
  /**
   * Result status.
   */
  success: boolean;

  /**
   * The package.json's name filed.
   */
  name: string;

  /**
   * The module name or the fs absolute path.
   */
  fullName: string;
}

/**
 * Module options interface.
 */
export interface ModuleOptionsInterface {
  proxy?: string;
  registry?: string;
}

/**
 * Module type.
 * 1. @xxx/eo-module-xxx -> scope
 * 2. eo-module-xxx -> normal
 * 3. xxx -> simple
 * 4. not exists or is a path -> unknown
 */
export type ModuleType = 'simple' | 'scope' | 'normal' | 'unknown';
