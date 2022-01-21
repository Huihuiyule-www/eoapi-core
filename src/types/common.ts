/**
 * Key map interface.
 */
export interface KeyMapInterface<T> {
  [key: string]: T extends T ? T : any;
}

/**
 * Undefinable type.
 */
export type UndefinableType<T> = T | undefined;

/**
 * Public events.
 */
export enum EOEventEnum {
  MODULE_INSTALL = 'module_install',
  MODULE_INSTALL_SUCCESS = 'module_install_success',
  MODULE_INSTALL_FAILED = 'module_install_failed',
  MODULE_UNINSTALL = 'module_uninstall',
  MODULE_UNINSTALL_SUCCESS = 'module_uninstall_success',
  MODULE_UNINSTALL_FAILED = 'module_uninstall_failed',
  MODULE_UPGRADE = 'module_upgrade',
  MODULE_UPGRADE_SUCCESS = 'module_upgrade_success',
  MODULE_UPGRADE_FAILED = 'module_upgrade_failed',
  MODULE_ENABLE = 'module_enable',
  MODULE_ENABLE_SUCCESS = 'module_enable_success',
  MODULE_ENABLE_FAILED = 'module_enable_failed',
  MODULE_DISABLE = 'module_disable',
  MODULE_DISABLE_SUCCESS = 'module_disable_success',
  MODULE_DISABLE_FAILED = 'module_disable_failed',
  FAILED = 'failed',
  NOTIFICATION = 'notification'
}

/**
 * Internal used events.
 */
export enum SystemEventEnum {
  CONFIG_CHANGE = 'config_change'
}

/**
 * Spawn output.
 */
export interface ResultInterface {
  code: number;
  data: string;
}
