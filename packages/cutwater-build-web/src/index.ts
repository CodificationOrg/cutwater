import {
  ExecutableTask,
  getConfig,
  jest,
  parallel,
  prettier,
  serial,
  setConfig,
  task,
} from '@codification/cutwater-build-core';
import { tsc, TscTask, tslint } from '@codification/cutwater-build-typescript';
import { webpack } from '@codification/cutwater-build-webpack';

export * from '@codification/cutwater-build-core';
export * from '@codification/cutwater-build-typescript';
export * from '@codification/cutwater-build-webpack';

// tslint:disable-next-line:no-string-literal
const PRODUCTION: boolean = !!getConfig().args['production'] || !!getConfig().args['ship'];
setConfig({
  production: PRODUCTION,
  shouldWarningsFailBuild: PRODUCTION,
});

export const buildTasks: ExecutableTask = task('build', serial(prettier, parallel(tslint, tsc)));

export const bundleTasks: ExecutableTask = task('bundle', serial(buildTasks, webpack));

export const testTasks: ExecutableTask = task('test', serial(buildTasks, jest));

tsc.name = 'tsc-commonjs';

const tscAmdTask: TscTask = new TscTask();
tscAmdTask.name = 'tsc-amd';
tscAmdTask.setConfig({
  customArgs: {
    outDir: './lib-amd',
    module: 'amd',
  },
});

const tscEsnextTask: TscTask = new TscTask();
tscEsnextTask.name = 'tsc-es6';
tscEsnextTask.setConfig({
  customArgs: {
    outDir: './lib-es6',
    module: 'esnext',
  },
});

export const defaultTasks: ExecutableTask = task(
  'default',
  parallel(serial(bundleTasks, jest), tscAmdTask, tscEsnextTask),
);

setConfig({
  libAMDFolder: 'lib-amd',
  libES6Folder: 'lib-es6',
});

task('default', defaultTasks);
