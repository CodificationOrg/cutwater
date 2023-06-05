if (process.argv.indexOf('--no-color') === -1) {
  process.argv.push('--color');
}

import * as gulp from 'gulp';

import { CustomTask } from './CustomTask';
import { CleanFlagTask } from './tasks/CleanFlagTask';
import { CleanTask } from './tasks/CleanTask';
import { CopyStaticAssetsTask } from './tasks/CopyStaticAssetsTask';
import { JestTask } from './tasks/JestTask';
import { PrettierTask } from './tasks/PrettierTask';
import { BuildConfig, BuildContext, ExecutableTask } from './types';
import { CustomGulpTask } from './types/CustomGulpTask';

export * from './Constants';
export { Logger } from './logging';
export * from './support';
export * from './tasks';
export { BuildConfig, BuildContext, BuildMetrics, BuildState, ExecutableTask } from './types';

export const setConfig = (config: Partial<BuildConfig>): void => {
  const newConfig: BuildConfig = { ...getConfig(), ...config };
  if (buildContext) {
    buildContext.buildConfig = newConfig;
  } else {
    buildConfig = newConfig;
  }
};

export const replaceConfig = (config: BuildConfig): void => {
  if (buildContext) {
    buildContext.buildConfig = config;
  } else {
    buildConfig = config;
  }
};

export const getConfig = (): BuildConfig => {
  return buildContext ? buildContext.buildConfig : buildConfig;
};

export function task(taskName: string, taskExecutable: ExecutableTask<unknown>): ExecutableTask<unknown> {
  taskExecutable = serial(cleanFlag, taskExecutable);
  taskMap[taskName] = taskExecutable;
  trackTask(taskExecutable);
  return taskExecutable;
}

export function subTask(taskName: string, fn: CustomGulpTask): ExecutableTask<unknown> {
  const customTask: CustomTask = new CustomTask(taskName, fn);
  return customTask;
}

export function watch(watchMatch: string | string[], taskExecutable: ExecutableTask<unknown>): ExecutableTask<unknown> {
  trackTask(taskExecutable);

  let isWatchRunning = false;
  let shouldRerunWatch = false;
  let lastError: Error | undefined;

  const successMessage = 'Build succeeded';
  const failureMessage = 'Build failed';

  return {
    execute: (context: BuildContext): Promise<void> => {
      return new Promise<void>(() => {
        function runWatch(): Promise<void> {
          if (isWatchRunning) {
            shouldRerunWatch = true;
            return Promise.resolve();
          } else {
            isWatchRunning = true;

            return executeTask(taskExecutable, context)
              .then(() => {
                if (lastError) {
                  lastError = undefined;
                  logger.log(successMessage);
                }
                return finalizeWatch();
              })
              .catch((error: Error) => {
                if (!lastError || lastError !== error) {
                  lastError = error;
                  logger.log(failureMessage);
                }

                return finalizeWatch();
              });
          }
        }

        function finalizeWatch(): Promise<void> {
          isWatchRunning = false;

          if (shouldRerunWatch) {
            shouldRerunWatch = false;
            return runWatch();
          }
          return Promise.resolve();
        }

        context.state.watchMode = true;
        context.gulp.watch(watchMatch, runWatch);
        runWatch().catch(console.error);
      });
    },
  };
}

export function serial(...tasks: Array<ExecutableTask<unknown>[] | ExecutableTask<unknown>>): ExecutableTask<unknown> {
  const flatTasks: ExecutableTask<unknown>[] = flatten(tasks).filter((taskExecutable) => {
    return taskExecutable !== null && taskExecutable !== undefined;
  }) as ExecutableTask<unknown>[];

  for (const flatTask of flatTasks) {
    trackTask(flatTask);
  }

  return {
    execute: (localContext: BuildContext): Promise<void> => {
      let output: Promise<void> = Promise.resolve();

      for (const taskExecutable of flatTasks) {
        output = output.then(() => executeTask(taskExecutable, localContext));
      }

      return output;
    },
  };
}

/**
 * Takes in IExecutables as arguments and returns an IExecutable that will execute them in parallel.
 * @public
 */
export function parallel(...tasks: Array<ExecutableTask<unknown>[] | ExecutableTask<unknown>>): ExecutableTask<void> {
  const flatTasks: ExecutableTask<unknown>[] = flatten<ExecutableTask<unknown>>(tasks).filter((taskExecutable) => {
    return taskExecutable !== null && taskExecutable !== undefined;
  });

  for (const flatTask of flatTasks) {
    trackTask(flatTask);
  }

  return {
    execute: (localContext: BuildContext): Promise<void> => {
      return new Promise<void>((resolve, reject) => {
        const promises: Array<Promise<void>> = [];
        for (const taskExecutable of flatTasks) {
          promises.push(executeTask(taskExecutable, localContext));
        }
        // Use promise all to make sure errors are propagated correctly
        Promise.all<void>(promises).then(
          () => resolve(),
          (err) => reject(err),
        );
      });
    },
  };
}

export const createTestBuildContext = (): BuildContext => {
  initialize(gulp);
  return createContext(buildConfig, gulp, logger);
};

export const executeTaskTest = (task: ExecutableTask<unknown>): Promise<void> => {
  return task.execute(createTestBuildContext());
};

function trackTask(taskExecutable: ExecutableTask<unknown>): void {
  if (uniqueTasks.indexOf(taskExecutable) < 0) {
    uniqueTasks.push(taskExecutable);
  }
}

function flatten<T>(oArr: Array<T | T[]>): T[] {
  const output: T[] = [];

  function traverse(arr: Array<T | T[]>): void {
    arr.forEach((el) => {
      if (Array.isArray(el)) {
        traverse(el as T[]);
      } else {
        output.push(el as T);
      }
    });
  }

  traverse(oArr);
  return output;
}

export const cleanFlag: ExecutableTask<unknown> = new CleanFlagTask();
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
