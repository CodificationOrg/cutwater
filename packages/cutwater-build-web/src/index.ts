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
  SRC_WATCH_GLOB,
  task,
  tsc,
  tscAlt,
  eslint,
  watch,
} from '@codification/cutwater-build-typescript';
import { webpack } from '@codification/cutwater-build-webpack';
import { WebpackDevServerTask } from './tasks/WebpackDevServerTask';

export * from '@codification/cutwater-build-typescript';
export * from '@codification/cutwater-build-webpack';

const PRODUCTION: boolean = !!getConfig().args['production'] || !!getConfig().args['ship'];
setConfig({
  production: PRODUCTION,
  shouldWarningsFailBuild: PRODUCTION,
});

export const tscEs6: ExecutableTask<unknown> = tscAlt('es6');
export const buildSubtask: ExecutableTask<unknown> = parallel(tsc, tscEs6, copyStaticAssets);
export const buildTasks: ExecutableTask<unknown> = serial(prettier, eslint, buildSubtask);
export const bundleTasks: ExecutableTask<unknown> = serial(buildTasks, webpack);
export const testTasks: ExecutableTask<unknown> = serial(prettier, eslint, jest);
export const integrationTask: ExecutableTask<unknown> = serial(prettier, eslint, jestIntegration);

export const webpackDevServer: ExecutableTask<unknown> = new WebpackDevServerTask();
export const defaultTasks: ExecutableTask<unknown> = serial(testTasks, buildSubtask, webpack);

task('build', buildTasks);
task('bundle', bundleTasks);
task('test', testTasks);
task('watch', watch(SRC_WATCH_GLOB, parallel(tscEs6, copyStaticAssets)));
task('test-integ', integrationTask);
task('start-server', webpackDevServer);
task('default', defaultTasks);
