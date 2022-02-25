# EOAPI-Core

A tool for api testing. Both CLI & api supports. It also supports module system.

## Installation

EOAPI-Core should be installed with node.js >= 12.

### Global install

```bash
npm install eoapi-core -g
```

### Local install

```bash
npm install eoapi-core -D
```

## Usage

### Use in CLI

Show help:

```bash
$ eo -h

Usage: eo [options] [command]

Options:
  -v, --version                             output the version number
  -d, --debug                               debug mode
  -s, --silent                              silent mode
  -c, --config <path>                       set config path
  -h, --help                                display help for command

Commands:
  module|m [options] <action> <modules...>  module manager, install, uninstall, upgrade, enable, disable modules.
  help [command]                            display help for command
```

#### Generate a new plugin quickly

In the terminal generate a new plugin template by running the following command:

```bash
eo g plugin-name
```

It will create a `index.js` and `package.json` in `plugin-name/`.

#### Module install

```bash
eo module install eo-module-test
```

#### Module uninstall

```bash
eo module uninstall eo-module-test
```

#### Module upgrade

```bash
eo module upgrade eo-module-test
```

#### Module enable

```bash
eo module enable eo-module-test
```

#### Module disable

```bash
eo module disable eo-module-test
```
