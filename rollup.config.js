import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';
import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';
import { string } from 'rollup-plugin-string';
import json from '@rollup/plugin-json';
import builtins from 'builtins';
import replace from '@rollup/plugin-replace';

const version = process.env.VERSION || pkg.version;
const sourcemap = 'inline';
const banner = `/*
 * eoapi-core@${version}, https://github.com/eolinker/eoapi-core
 * Released under the Apache License.
 */`;
const input = './src/index.ts';

const commonOptions = {
  external: [
    ...Object.keys(pkg.dependencies),
    ...builtins()
  ].map(packageName => new RegExp(`^${packageName}(/.*)?`)),
  plugins: [
    typescript({
      tsconfigOverride: {
        compilerOptions: {
          target: 'ES2017',
          module: 'ES2015'
        }
      }
    }),
    terser(),
    commonjs(),
    string({
      // Required to be specified
      include: [
        '**/*.applescript',
        '**/*.ps1',
        '**/*.sh'
      ]
    }),
    json(),
    replace({
      preventAssignment: true
    })
  ],
  input
};

/** @type import('rollup').RollupOptions */
const nodeCjs = {
  output: [{
    file: 'dist/index.cjs.js',
    format: 'cjs',
    banner,
    sourcemap
  }],
  ...commonOptions
};

const nodeEsm = {
  output: [{
    file: 'dist/index.esm.js',
    format: 'esm',
    banner,
    sourcemap
  }],
  ...commonOptions
};

const bundles = [];
const env = process.env.BUNDLES || '';
if (env.includes('cjs')) bundles.push(nodeCjs);
if (env.includes('esm')) bundles.push(nodeEsm);
if (bundles.length === 0) bundles.push(nodeCjs, nodeEsm);

export default bundles;
