import {
  copyStaticAssets,
  eslint,
  ExecutableTask,
  getConfig,
  jest,
  jestIntegration,
  prettier,
  serial,
  setConfig,
  task,
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

export const buildTasks: ExecutableTask<unknown> = serial(prettier, eslint, copyStaticAssets);
export const bundleTasks: ExecutableTask<unknown> = serial(buildTasks, webpack);
export const testTasks: ExecutableTask<unknown> = serial(prettier, eslint, jest);
export const integrationTask: ExecutableTask<unknown> = serial(prettier, eslint, jestIntegration);

export const webpackDevServer: ExecutableTask<unknown> = new WebpackDevServerTask();
export const defaultTasks: ExecutableTask<unknown> = serial(testTasks, copyStaticAssets, webpack);

task('build', buildTasks);
task('bundle', bundleTasks);
task('test', testTasks);
task('test-integ', integrationTask);
task('start-server', webpackDevServer);
task('default', defaultTasks);
