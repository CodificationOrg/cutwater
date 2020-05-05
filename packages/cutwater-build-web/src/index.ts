import {
  copyStaticAssets,
  ExecutableTask,
  getConfig,
  jest,
  jestIntegration,
  parallel,
  prettier,
  serial,
  setConfig,
  task,
  watch,
} from '@codification/cutwater-build-core';
import { tsc, TscTask, tslint } from '@codification/cutwater-build-typescript';
import { webpack } from '@codification/cutwater-build-webpack';
import { WebpackDevServerTask } from './tasks/WebpackDevServerTask';

export * from '@codification/cutwater-build-core';
export * from '@codification/cutwater-build-typescript';
export * from '@codification/cutwater-build-webpack';

// tslint:disable-next-line:no-string-literal
const PRODUCTION: boolean = !!getConfig().args['production'] || !!getConfig().args['ship'];
setConfig({
  production: PRODUCTION,
  shouldWarningsFailBuild: PRODUCTION,
});

export const buildSubtask: ExecutableTask = parallel(tslint, tsc, copyStaticAssets);

export const buildTasks: ExecutableTask = task('build', serial(prettier, buildSubtask));

export const bundleTasks: ExecutableTask = task('bundle', serial(buildTasks, webpack));

export const testTasks: ExecutableTask = task('test', serial(buildSubtask, jest));
export const integrationTask: ExecutableTask = task('test-integ', serial(buildSubtask, jestIntegration));

tsc.name = 'tsc-commonjs';

export const tscAmd: TscTask = new TscTask();
tscAmd.name = 'tsc-amd';
tscAmd.setConfig({
  customArgs: {
    outDir: './lib-amd',
    module: 'amd',
  },
});

export const tscEs6: TscTask = new TscTask();
tscEs6.name = 'tsc-es6';
tscEs6.setConfig({
  customArgs: {
    outDir: './lib-es6',
    module: 'esnext',
  },
});

export const defaultTasks: ExecutableTask = task('default', parallel(serial(bundleTasks, jest), tscAmd, tscEs6));

setConfig({
  libAMDFolder: 'lib-amd',
  libES6Folder: 'lib-es6',
});

export const webWatch: ExecutableTask = task(
  'watch',
  watch(['src/**/*.*', 'public/**/*.*'], serial(tscEs6, copyStaticAssets, webpack)),
);
export const webpackDevServer: ExecutableTask = new WebpackDevServerTask();

task('default', defaultTasks);
