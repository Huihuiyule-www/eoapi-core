const template = {
  genIndexJS: (name: string) => `module.exports = function () {
  return {
    id: '${name}',
    name: '${name}',
    core: '1.x',
    version: '1.0.0',
    description: '${name} module description',
    package: 'Community',
    config: function (eo) {
      console.log('config run')
      return eo
    },
    cli__core: function (eo) {
      console.log('cli__core')
      return eo
    },
    app__db_init: function (eo) {
      console.log('app__db_init')
      return eo
    },
    app__db_load: function (eo) {
      console.log('app__db_load')
      eo.output.push('test')
      return eo
    }
  }
}
    `,
  genPackageJSON: (name: string) =>
`{
  "name": "${name}",
  "version": "1.0.0",
  "description": "A ${name} module.",
  "main": "index.js",
  "author": "Eolink",
  "license": "Apache-2.0 License",
  "devDependencies": {
      "@types/node": "^17.0.10"
  }
}`

}

export default template;
