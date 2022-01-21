# EO-Core

A tool for api testing. Both CLI & api supports. It also supports module system.

## Installation

EO-Core should be installed with node.js >= 12.

### Global install

```bash
npm install eo-core -g
```

### Local install

```bash
npm install eo-core -D
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
