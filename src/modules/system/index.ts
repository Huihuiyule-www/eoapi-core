import { EOInterface, EOModuleInterface } from '../../types';

const module = (): EOModuleInterface => {
  return {
    id: 'system',
    name: 'System',
    core: '1.x',
    version: '1.0.0',
    description: 'System module of eo',
    package: 'Core',
    install(eo: EOInterface): EOInterface {
      eo.logger.info(`run install [${this.name} ${this.version}]`);
      return eo;
    },
    uninstall(eo: EOInterface): EOInterface {
      eo.logger.info(`run uninstall [${this.name} ${this.version}]`);
      return eo;
    },
    config(eo: EOInterface): EOInterface {
      eo.logger.info(`run config [${this.name} ${this.version}]`);
      return eo;
    },
    cli__core(eo: EOInterface): EOInterface {
      eo.logger.info(`run cli__core [${this.name} ${this.version}]`);
      eo.command.version(this.version, '-v, --version')
        .option('-d, --debug', 'debug mode', () => {
          eo.setConfig({debug: true});
        })
        .option('-s, --silent', 'silent mode', () => {
          eo.setConfig({silent: true});
        })
        .option('-c, --config <path>', 'set config path')
        .on('command:*', () => {
          eo.logger.error(`Invalid command: ${eo.command.args.join(' ')}\nSee --help for a list of available commands.`);
          process.exit(1)
        });
      return eo;
    },
    cli__module(eo: EOInterface): EOInterface {
      eo.logger.info(`run cli__module [${this.name} ${this.version}]`);
      eo.command
        .command('module')
        .alias('m')
        .argument('<action>', 'action')
        .argument('<modules...>', 'module names')
        .description('module manager, install, uninstall, upgrade, enable, disable modules.')
        .option('-p, --proxy <proxy>', 'add proxy for installing')
        .option('-r, --registry <registry>', 'choose a registry for installing')
        .action((action: string, modules: string[], options: any) => {
          switch (action) {
            case 'install':
            case 'add':
              eo.module.install(modules, options).catch((e: Error) => { eo.logger.error(e) });
              break;
            case 'uninstall':
            case 'rm':
              eo.module.uninstall(modules).catch((e: Error) => { eo.logger.error(e) });
              break;
            case 'upgrade':
            case 'up':
              eo.module.upgrade(modules, options).catch((e: Error) => { eo.logger.error(e) });
              break;
            case 'enable':
            case 'en':
              eo.logger.info('enable module');
              eo.module.enable(modules).catch((e: Error) => { eo.logger.error(e) });
              break;
            case 'disable':
            case 'dis':
              eo.logger.info('disable module');
              eo.module.disable(modules).catch((e: Error) => { eo.logger.error(e) });
              break;
            default:
              eo.hookDemo();
              eo.logger.error("argument action only support 'install|add', 'uninstall|rm', 'upgrade|up', 'enable|en', 'disable|dis'");
              break;
          }
        });
      return eo;
    },
    app__db_load(eo: EOInterface): EOInterface {
      eo.logger.info(`run app__db_load [${this.name} ${this.version}]`);
      eo.output.push(...eo.input);
      eo.output.push('append');
      return eo;
    },
    app__db_save(eo: EOInterface): EOInterface {
      eo.logger.info(`run app__db_save [${this.name} ${this.version}]`);
      return eo;
    },
    async app_async__data_export(eo: EOInterface): Promise<EOInterface> {
      eo.logger.info(`run app_async__data_export [${this.name} ${this.version}]`);
      return eo;
    }
  };
};

export default module;
