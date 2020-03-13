import { copyStaticAssets, ExecutableTask, getConfig, jest, jestIntegration, parallel, prettier, serial, setConfig, task, watch } from '@codification/cutwater-build-core';
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

export const buildSubtask: ExecutableTask = parallel(tslint, tsc, copyStaticAssets);

export const buildTasks: ExecutableTask = task('build', serial(prettier, buildSubtask));

export const bundleTasks: ExecutableTask = task('bundle', serial(buildTasks, webpack));

export const testTasks: ExecutableTask = task('test', serial(buildSubtask, jest));
export const integrationTask: ExecutableTask = task('test-integ', serial(buildSubtask, jestIntegration));

export const watchTasks: ExecutableTask = task('watch', watch('src/**.ts', serial(testTasks, webpack)));

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
