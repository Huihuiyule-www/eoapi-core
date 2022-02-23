import { EOInterface, EOModuleInterface } from '../../types';
import fs from 'fs';
import path from 'path';
import { ensureDir } from '../../utils'
import tmpl from './tmpl';

const module = (): EOModuleInterface => {
  return {
    id: 'generate',
    name: 'Generate',
    core: '1.x',
    version: '1.0.0',
    description: 'Generate module template file',
    package: 'Core',
    cli__core(eo: EOInterface): EOInterface {
      eo.logger.info(`run cli__core [${this.name} ${this.version}]`);
      eo.command
        .command('generate')
        .alias('g')
        .argument('<name>', 'module name')
        .description('create a module template.')
        .action((name: string) => {
          if (!/^eo-module-/.test(name)) {
            name = 'eo-module-' + name;
          }
          const mainTemplate = tmpl.genIndexJS(name);
          const packageTemplate = tmpl.genPackageJSON(name);
          const _path = path.join(process.cwd(), name);
          ensureDir(_path);
          fs.writeFileSync(`${_path}/index.js`, mainTemplate);
          eo.logger.info(`${_path}/index.js is generated.`);
          fs.writeFileSync(`${_path}/package.json`, packageTemplate);
          eo.logger.info(`${_path}/package.json is generated.`);
        });
      return eo;
    },
  };
};

export default module;
