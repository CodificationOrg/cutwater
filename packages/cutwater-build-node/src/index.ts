import {
  copyStaticAssets,
  ExecutableTask,
  jest,
  parallel,
  prettier,
  serial,
  setConfig,
  task,
  tsc,
  tslint,
} from '@codification/cutwater-build-typescript';

export * from '@codification/cutwater-build-typescript';

const PRODUCTION: boolean = process.argv.indexOf('--production') !== -1 || process.argv.indexOf('--ship') !== -1;
setConfig({
  production: PRODUCTION,
  shouldWarningsFailBuild: PRODUCTION,
});

const buildSubtask: ExecutableTask = serial(prettier, parallel(tslint, tsc, copyStaticAssets));

export const buildTasks: ExecutableTask = task('build', buildSubtask);
export const testTasks: ExecutableTask = task('test', serial(buildSubtask, jest));
export const defaultTasks: ExecutableTask = task('default', serial(buildSubtask, jest));
