if (process.argv.indexOf('--no-color') === -1) {
  process.argv.push('--color');
}

import { BuildEngine } from './core';
import { CleanFlagTask } from './tasks/CleanFlagTask';
import { CleanTask } from './tasks/CleanTask';
import { CopyStaticAssetsTask } from './tasks/CopyStaticAssetsTask';
import { JestTask } from './tasks/JestTask';
import { PrettierTask } from './tasks/PrettierTask';
import { ExecutableTask } from './types';

export { BuildState } from './core/BuildState';
export * from './core/Constants';
export { Logger } from './logging';
export * from './support';
export * from './tasks';
export { BuildConfig, BuildContext, BuildMetrics, ExecutableTask } from './types';

export const buildEngine = new BuildEngine();
export const cleanFlag: ExecutableTask<unknown> = new CleanFlagTask();

export const task = (taskName: string, taskExecutable: ExecutableTask<unknown>): ExecutableTask<unknown> => {
  return buildEngine.task(taskName, serial(cleanFlag, taskExecutable));
};

export const serial = (
  ...tasks: Array<ExecutableTask<unknown>[] | ExecutableTask<unknown>>
): ExecutableTask<unknown> => {
  return buildEngine.serial(...tasks);
};

export const parallel = (
  ...tasks: Array<ExecutableTask<unknown>[] | ExecutableTask<unknown>>
): ExecutableTask<void> => {
  return buildEngine.parallel(...tasks);
};

export const clean: ExecutableTask<unknown> = new CleanTask();
export const prettier: ExecutableTask<unknown> = new PrettierTask();
export const copyStaticAssets: CopyStaticAssetsTask = new CopyStaticAssetsTask();
export const jest: JestTask = new JestTask();

task('clean', clean);
task('jest', jest);
task('prettier', prettier);

export const jestIntegration: JestTask = new JestTask();
jestIntegration.name = 'jest-integration';
jestIntegration.setConfig({
  isEnabled: true,
  options: { ...jestIntegration.config.options, testMatch: ['<rootDir>/src/**/*.(integ).(ts|js)?(x)'] },
});
task('jest-integration', jestIntegration);
