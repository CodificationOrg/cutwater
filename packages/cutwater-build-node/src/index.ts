import {
  copyStaticAssets,
  ExecutableTask,
  jest,
  jestIntegration,
  parallel,
  prettier,
  serial,
  setConfig,
  task,
  tsc,
  tscWatch,
  tslint,
} from '@codification/cutwater-build-typescript';

export * from '@codification/cutwater-build-typescript';

const PRODUCTION: boolean = process.argv.indexOf('--production') !== -1 || process.argv.indexOf('--ship') !== -1;
setConfig({
  production: PRODUCTION,
  shouldWarningsFailBuild: PRODUCTION,
});

const buildSubtask: ExecutableTask = parallel(tsc, copyStaticAssets);

export const buildTasks: ExecutableTask = serial(prettier, tslint, buildSubtask);
export const testTasks: ExecutableTask = serial(buildSubtask, jest);
export const integrationTask: ExecutableTask = serial(buildSubtask, jestIntegration);
export const defaultTasks: ExecutableTask = serial(buildTasks, jest);

task('build', buildTasks);
task('test', testTasks);
task('test-integ', integrationTask);
task('watch', tscWatch);
task('default', defaultTasks);
