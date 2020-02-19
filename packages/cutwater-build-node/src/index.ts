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
  watch,
} from '@codification/cutwater-build-typescript';

export * from '@codification/cutwater-build-typescript';

const PRODUCTION: boolean = process.argv.indexOf('--production') !== -1 || process.argv.indexOf('--ship') !== -1;
setConfig({
  production: PRODUCTION,
  shouldWarningsFailBuild: PRODUCTION,
});

const buildSubtask: ExecutableTask = parallel(tslint, tsc, copyStaticAssets);

export const buildTasks: ExecutableTask = task('build', serial(prettier, buildSubtask));
export const testTasks: ExecutableTask = task('test', serial(buildSubtask, jest));
export const watchTask: ExecutableTask = task('watch', watch('src/**.ts', testTasks));
export const defaultTasks: ExecutableTask = task('default', serial(prettier, buildTasks));
