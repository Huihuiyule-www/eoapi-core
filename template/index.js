module.exports = function () {
  return {
    id: 'eo-module-test',
    name: 'Test',
    core: '1.x',
    version: '1.0.0',
    description: 'Test module for community',
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
