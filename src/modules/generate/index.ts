import { EOInterface, EOModuleInterface } from '../../types'
import * as fs from 'fs'
import path from 'path'
import { ensureDir } from '../../utils'
import tmpl from './tmpl'

const module = (): EOModuleInterface => {
  return {
    id: 'generate',
    name: 'Generate',
    core: '1.x',
    version: '1.0.0',
    description: 'Generate module template file',
    package: 'Core',
    cli__core(eo: EOInterface): EOInterface {
      eo.logger.info(`run cli__core [${this.name} ${this.version}]`)
      eo.command
        .command('generate')
        .alias('g')
        .argument('<name>', 'module name')
        .description('create a module template.')
        .action((name: string) => {
          if (!/^eo-module-/.test(name)) {
            name = 'eo-module-' + name
          }
          const _path = path.join(process.cwd(), name)
          ensureDir(_path)
          fs.writeFileSync(`${_path}/package.json`, tmpl.genPackageJSON(name))
          fs.writeFileSync(`${_path}/tsconfig.json`, tmpl.genTsconfig())
          fs.writeFileSync(`${_path}/.gitignore`, tmpl.genGitignore())
          fs.writeFileSync(`${_path}/.npmignore`, tmpl.genNpmignore())
          fs.writeFileSync(`${_path}/README.md`, tmpl.genReadme(name))
          const _src = path.join(_path, 'src')
          ensureDir(_src)
          fs.writeFileSync(`${_src}/index.ts`, tmpl.genIndex(name))
          const _github = path.join(_path, '.github', 'workflows')
          ensureDir(_github)
          fs.writeFileSync(`${_github}/npm-publish.yml`, tmpl.genNpmpublish())
          eo.logger.info(`Template files of module ${name} is generated.`)
        })
      return eo
    }
  }
}

export default module
