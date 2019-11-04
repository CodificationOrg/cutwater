import { ExecutableTask, task } from '@codification/cutwater-build-core';

import { TscTask } from './tasks/TscTask';
import { TsLintTask } from './tasks/TsLintTask';

export * from './tasks/TscTask';
export * from './tasks/TsLintTask';
export * from '@codification/cutwater-build-core';

export const tsc: ExecutableTask = new TscTask();
export const tslint: ExecutableTask = new TsLintTask();

task('tsc', tsc);
task('tslint', tslint);
