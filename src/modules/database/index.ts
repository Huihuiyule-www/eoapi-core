import { EOInterface, EOModuleInterface } from '../../types';

const module = (): EOModuleInterface => {
  return {
    id: 'database',
    name: 'Database',
    core: '1.x',
    version: '1.0.0',
    description: 'Database module for entity data storage',
    package: 'Core',
    config(eo: EOInterface): EOInterface {
      return eo;
    },
    cli__core(eo: EOInterface): EOInterface {
      return eo;
    },
    app__db_init(eo: EOInterface): EOInterface {
      return eo;
    },
    app__db_load(eo: EOInterface): EOInterface {
      eo.output.push('database');
      return eo;
    }
  };
};

export default module;
