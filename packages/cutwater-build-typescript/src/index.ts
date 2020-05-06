import { ExecutableTask, getConfig, setConfig, task, watch } from '@codification/cutwater-build-core';
import { TscTask } from './tasks/TscTask';
import { TsLintTask } from './tasks/TsLintTask';

export * from '@codification/cutwater-build-core';
export * from './tasks/TscTask';
export * from './tasks/TsLintTask';

const SRC_WATCH_GLOB: string[] = [`${getConfig().srcFolder}/**/*.ts*`, `!${getConfig().srcFolder}/**/*.test.*`];

export const tsc: ExecutableTask = new TscTask();
tsc.name = 'tsc-commonjs';
export const tscWatch: ExecutableTask = watch(SRC_WATCH_GLOB, tsc);

export const tscAmd: TscTask = new TscTask();
tscAmd.name = 'tsc-amd';
tscAmd.setConfig({
  customArgs: {
    outDir: './lib-amd',
    module: 'amd',
  },
});
export const tscAmdWatch: ExecutableTask = watch(SRC_WATCH_GLOB, tscAmd);

export const tscEs6: TscTask = new TscTask();
tscEs6.name = 'tsc-es6';
tscEs6.setConfig({
  customArgs: {
    outDir: './lib-es6',
    module: 'esnext',
  },
});
export const tscEs6Watch: ExecutableTask = watch(SRC_WATCH_GLOB, tscEs6);

setConfig({
  libAMDFolder: 'lib-amd',
  libES6Folder: 'lib-es6',
});

export const tslint: ExecutableTask = new TsLintTask();

task('tsc', tsc);
task('tsc-watch', tscWatch);
task('tscAmd', tscAmd);
task('tscAmd-watch', tscAmdWatch);
task('tscEs6', tscEs6);
task('tscEs6-watch', tscEs6Watch);
task('tslint', tslint);
