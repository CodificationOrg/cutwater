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
  tslint,
  watch,
} from '@codification/cutwater-build-typescript';
import { webpack } from '@codification/cutwater-build-webpack';
import { WebpackDevServerTask } from './tasks/WebpackDevServerTask';

export * from '@codification/cutwater-build-typescript';
export * from '@codification/cutwater-build-webpack';

// tslint:disable-next-line:no-string-literal
const PRODUCTION: boolean = !!getConfig().args['production'] || !!getConfig().args['ship'];
setConfig({
  production: PRODUCTION,
  shouldWarningsFailBuild: PRODUCTION,
});

export const tscEs6: ExecutableTask = tscAlt('es6');
export const buildSubtask: ExecutableTask = parallel(tsc, tscEs6, copyStaticAssets);
export const buildTasks: ExecutableTask = serial(prettier, tslint, buildSubtask);
export const bundleTasks: ExecutableTask = serial(buildTasks, webpack);
export const testTasks: ExecutableTask = serial(tslint, buildSubtask, jest);
export const integrationTask: ExecutableTask = serial(tslint, buildSubtask, jestIntegration);

export const webpackDevServer: ExecutableTask = new WebpackDevServerTask();
export const defaultTasks: ExecutableTask = serial(prettier, testTasks, webpack);

task('build', buildTasks);
task('bundle', bundleTasks);
task('test', testTasks);
task('watch', watch(SRC_WATCH_GLOB, parallel(tscEs6, copyStaticAssets)));
task('test-integ', integrationTask);
task('start-server', webpackDevServer);
task('default', defaultTasks);
