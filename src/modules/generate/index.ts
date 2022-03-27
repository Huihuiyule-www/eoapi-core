import { EOInterface, EOModuleInterface } from '../../types'
import * as fs from 'fs'
import http from 'got'
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
      eo.command
        .command('upload')
        .argument('<name>', 'module name')
        .description('Upload the plugin message to plugin market.')
        .action(async (pkgName: string) => {
          if (!/^eo-module-/.test(pkgName)) {
            pkgName = 'eo-module-' + pkgName
          }
          const _path = path.join(process.cwd(), pkgName)
          const packageJson = fs.readFileSync(`${_path}/package.json`, 'utf8')
          const { name, version, main, author, description } =
            JSON.parse(packageJson)
          const { code, msg } = await http
            .post('http://127.0.0.1:3000/upload', {
              json: { name, version, main, author, description }
            })
            .json()
          if (code === 0) {
            console.log('🥂', msg)
          }
        })
      eo.command
        .command('reliable')
        .argument('<name>', 'module name')
        .description('reliable the plugin.')
        .action(async (pkgName: string) => {
          if (!/^eo-module-/.test(pkgName)) {
            pkgName = 'eo-module-' + pkgName
          }
          const _path = path.join(process.cwd(), pkgName)
          const packageJson = fs.readFileSync(`${_path}/package.json`, 'utf8')
          const { name } = JSON.parse(packageJson)
          const { code, msg } = await http
            .post('http://127.0.0.1:3000/reliable', {
              json: { name }
            })
            .json()
          if (code === 0) {
            console.log('🥂', msg)
          }
        })
      eo.command
        .command('unreliable')
        .argument('<name>', 'module name')
        .description('reliable the plugin.')
        .action(async (pkgName: string) => {
          if (!/^eo-module-/.test(pkgName)) {
            pkgName = 'eo-module-' + pkgName
          }
          const _path = path.join(process.cwd(), pkgName)
          const packageJson = fs.readFileSync(`${_path}/package.json`, 'utf8')
          const { name } = JSON.parse(packageJson)
          const { code, msg } = await http
            .post('http://127.0.0.1:3000/unreliable', {
              json: { name }
            })
            .json()
          if (code === 0) {
            console.log('🥂', msg)
          }
        })
      return eo
    }
  }
}

export default module
