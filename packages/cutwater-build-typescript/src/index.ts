import { ExecutableTask, buildEngine, task } from '@codification/cutwater-build-core';
import { EsLintTask } from './tasks/EsLintTask';
import { TscTask } from './tasks/TscTask';

export * from '@codification/cutwater-build-core';
export * from './tasks/EsLintTask';
export * from './tasks/TscTask';

export const SRC_WATCH_GLOB: string[] = [
  `${buildEngine.getConfig().srcFolder}/**/*.ts*`,
  `!${buildEngine.getConfig().srcFolder}/**/*.test.*`,
];

export const tsc: ExecutableTask<unknown> = new TscTask();

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
  buildEngine.setConfig({
    [`lib${configFolderMapping[module]}Folder`]: folder,
  });
  return rval;
};

export const eslint: ExecutableTask<unknown> = new EsLintTask();

task('tsc', tsc);
task('lint', eslint);
