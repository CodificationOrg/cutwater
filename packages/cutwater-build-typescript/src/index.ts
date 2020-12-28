import { ExecutableTask, getConfig, setConfig, task } from '@codification/cutwater-build-core';
import { TscTask } from './tasks/TscTask';
import { TsLintTask } from './tasks/TsLintTask';

export * from '@codification/cutwater-build-core';
export * from './tasks/TscTask';
export * from './tasks/TsLintTask';

export const SRC_WATCH_GLOB: string[] = [`${getConfig().srcFolder}/**/*.ts*`, `!${getConfig().srcFolder}/**/*.test.*`];

export const tsc: ExecutableTask = new TscTask();

const configFolderMapping = {
  amd: 'AMD',
  es6: 'ES6',
  esNext: 'ESNext',
};

export const tscAlt = (module: 'amd' | 'es6' | 'esNext'): TscTask => {
  const rval = new TscTask();
  rval.name = `tsc-${module}`;
  const folder = `lib-${module}`;
  rval.setConfig({
    options: {
      ...rval.config.options,
      outDir: `./${folder}`,
      module,
    },
  });
  rval.cleanMatch = [folder];
  setConfig({
    [`lib${configFolderMapping[module]}Folder`]: folder,
  });
  return rval;
};

export const tslint: ExecutableTask = new TsLintTask();

task('tsc', tsc);
task('tslint', tslint);
