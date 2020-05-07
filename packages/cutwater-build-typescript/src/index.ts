import { ExecutableTask, getConfig, setConfig, task } from '@codification/cutwater-build-core';
import { TscTask } from './tasks/TscTask';
import { TsLintTask } from './tasks/TsLintTask';

export * from '@codification/cutwater-build-core';
export * from './tasks/TscTask';
export * from './tasks/TsLintTask';

export const SRC_WATCH_GLOB: string[] = [`${getConfig().srcFolder}/**/*.ts*`, `!${getConfig().srcFolder}/**/*.test.*`];

export const tsc: ExecutableTask = new TscTask();

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

setConfig({
  libAMDFolder: 'lib-amd',
  libES6Folder: 'lib-es6',
});

export const tslint: ExecutableTask = new TsLintTask();

task('tsc', tsc);
task('tscAmd', tscAmd);
task('tscEs6', tscEs6);
task('tslint', tslint);
