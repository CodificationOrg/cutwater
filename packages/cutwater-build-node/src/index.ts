import {
  copyStaticAssets,
  eslint,
  ExecutableTask,
  jest,
  jestIntegration,
  parallel,
  prettier,
  serial,
  setConfig,
  SRC_WATCH_GLOB,
  task,
  tsc,
  watch,
} from '@codification/cutwater-build-typescript';

export * from '@codification/cutwater-build-typescript';

const PRODUCTION: boolean = process.argv.indexOf('--production') !== -1 || process.argv.indexOf('--ship') !== -1;
setConfig({
  production: PRODUCTION,
  shouldWarningsFailBuild: PRODUCTION,
});

const buildSubtask: ExecutableTask<unknown> = parallel(eslint, tsc, copyStaticAssets);

export const buildTasks: ExecutableTask<unknown> = serial(prettier, buildSubtask);
export const testTasks: ExecutableTask<unknown> = serial(prettier, eslint, jest);
export const integrationTask: ExecutableTask<unknown> = serial(prettier, eslint, jestIntegration);
export const defaultTasks: ExecutableTask<unknown> = serial(testTasks, tsc, copyStaticAssets);

task('build', buildTasks);
task('test', testTasks);
task('test-integ', integrationTask);
task('watch', watch(SRC_WATCH_GLOB, testTasks));
task('default', defaultTasks);
