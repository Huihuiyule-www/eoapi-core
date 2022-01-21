import { EOInterface } from './eo';
import { EOModuleInterface } from './module';

/**
 * Hook manager interface.
 */
export interface HookInterface {
  bind: (module: EOModuleInterface) => void;
  unbind: (module: EOModuleInterface) => void;
  invokeCommands: (eo: EOInterface, hookName?: string, ) => EOInterface;
  invoke: (eo: EOInterface, hookName: string) => EOInterface;
  invokePromise: (eo: EOInterface, hookName: string) => Promise<EOInterface>;
}
