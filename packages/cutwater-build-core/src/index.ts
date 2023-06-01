if (process.argv.indexOf('--no-color') === -1) {
  process.argv.push('--color');
}

import * as gulp from 'gulp';
import { Gulp } from 'gulp';
import { join, resolve } from 'path';

import { existsSync } from 'fs';
import { BuildConfig } from './BuildConfig';
import { BuildContext, createContext } from './BuildContext';
import { LOCK_FILES, LOCK_FILE_MAPPING } from './Constants';
import { ExecutableTask } from './ExecutableTask';
import { args, builtPackage, getFlagValue } from './State';
import { Logger, getLogger } from './logging/Logger';
import { CleanFlagTask } from './tasks/CleanFlagTask';
import { CleanTask } from './tasks/CleanTask';
import { CopyStaticAssetsTask } from './tasks/CopyStaticAssetsTask';
import { GulpTask } from './tasks/GulpTask';
import { JestTask, isJestEnabled } from './tasks/JestTask';
import { PrettierTask } from './tasks/PrettierTask';
import { MonorepoMetadata } from './support/MonorepoMetadata';

export { BuildConfig } from './BuildConfig';
export { BuildContext, BuildMetrics, BuildState } from './BuildContext';
export * from './Constants';
export { ExecutableTask } from './ExecutableTask';
export { Logger } from './logging/Logger';
export * from './tasks';
export * from './support';

const taskMap: { [key: string]: ExecutableTask<unknown> } = {};
const uniqueTasks: ExecutableTask<unknown>[] = [];

const packageFolder: string =
  builtPackage.directories && builtPackage.directories.packagePath ? builtPackage.directories.packagePath : '';

const logger: Logger = getLogger();

let buildContext: BuildContext;
let buildConfig: BuildConfig = {
  maxBuildTimeMs: 0,
  gulp: undefined as any,
  rootPath: undefined as any,
  packageFolder,
  srcFolder: 'src',
  distFolder: join(packageFolder, 'dist'),
  libAMDFolder: undefined,
  libESNextFolder: undefined,
  libFolder: join(packageFolder, 'lib'),
  tempFolder: 'temp',
  properties: {},
  relogIssues: getFlagValue('relogIssues', true),
  showToast: getFlagValue('showToast', true),
  buildSuccessIconPath: resolve(__dirname, 'pass.png'),
  buildErrorIconPath: resolve(__dirname, 'fail.png'),
  verbose: getFlagValue('verbose', false),
  production: getFlagValue('production', false),
  args: args as { [name: string]: string | boolean },
  shouldWarningsFailBuild: false,
};

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

export const cleanFlag: ExecutableTask<unknown> = new CleanFlagTask();

export function task(taskName: string, taskExecutable: ExecutableTask<unknown>): ExecutableTask<unknown> {
  taskExecutable = serial(cleanFlag, taskExecutable);
  taskMap[taskName] = taskExecutable;
  trackTask(taskExecutable);
  return taskExecutable;
}

export type CustomGulpTask = (
  gulp: Gulp,
  buildConfig: BuildConfig,
  done?: (failure?: string | Error) => void,
) => Promise<unknown> | NodeJS.ReadWriteStream | void;

class CustomTask extends GulpTask<void, unknown> {
  private customTask: CustomGulpTask;
  constructor(name: string, fn: CustomGulpTask) {
    super(name);
    this.customTask = fn.bind(this);
  }

  public executeTask(
    localGulp: Gulp,
    completeCallback?: (error?: string | Error) => void,
  ): Promise<unknown> | NodeJS.ReadWriteStream | void {
    return this.customTask(localGulp, getConfig(), completeCallback);
  }
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

const findLockFileName = (repoMetadata?: MonorepoMetadata): string | undefined => {
  const basePath = repoMetadata ? repoMetadata.rootPath : resolve(process.cwd());
  return LOCK_FILES.find((lockFile) => existsSync(resolve(basePath, lockFile)));
};

export function initialize(localGulp: Gulp): void {
  buildContext = createContext(buildConfig, localGulp, logger);

  getConfig().rootPath = process.cwd();

  const repoMetadata = MonorepoMetadata.findRepoRootPath(process.cwd()) ? MonorepoMetadata.create() : undefined;
  const lockFile = findLockFileName(repoMetadata);
  const npmClient = lockFile ? LOCK_FILE_MAPPING[lockFile] : undefined;

  getConfig().repoMetadata = repoMetadata;
  getConfig().lockFile = lockFile;
  getConfig().npmClient = npmClient;
  getConfig().gulp = localGulp;
  getConfig().uniqueTasks = uniqueTasks;
  getConfig().jestEnabled = isJestEnabled(getConfig().rootPath);

  handleCommandLineArguments();

  for (const uniqueTask of getConfig().uniqueTasks || []) {
    if (uniqueTask.onRegister) {
      uniqueTask.onRegister();
    }
  }

  if (!buildContext.metrics.start) {
    buildContext.metrics.start = process.hrtime();
  }

  Object.keys(taskMap).forEach((taskName) => registerTask(buildContext, taskName, taskMap[taskName]));

  buildContext.metrics.taskCreationTime = process.hrtime(buildContext.metrics.start);
}

export const createTestBuildContext = (): BuildContext => {
  initialize(gulp);
  return createContext(buildConfig, gulp, logger);
};

export const executeTaskTest = (task: ExecutableTask<unknown>): Promise<void> => {
  return task.execute(createTestBuildContext());
};

const registerTask = (localContext: BuildContext, taskName: string, taskExecutable: ExecutableTask<unknown>): void => {
  localContext.gulp.task(taskName, (cb) => {
    const maxBuildTimeMs: number =
      taskExecutable.maxBuildTimeMs === undefined ? getConfig().maxBuildTimeMs : taskExecutable.maxBuildTimeMs;
    const timer: NodeJS.Timer | undefined =
      maxBuildTimeMs === 0
        ? undefined
        : setTimeout(() => {
            logger.error(
              `Build ran for ${maxBuildTimeMs} milliseconds without completing. Cancelling build with error.`,
            );
            cb(new Error('Timeout'));
          }, maxBuildTimeMs);
    executeTask(taskExecutable, localContext)
      .then(() => {
        if (timer) {
          clearTimeout(timer);
        }
        cb();
      })
      .catch((executionError: Error) => {
        if (timer) {
          clearTimeout(timer);
        }
        cb(generateGulpError(executionError));
      });
  });
};

const generateGulpError = (err: Error): Error => {
  let rval: Error;
  if (logger.isVerboseEnabled()) {
    rval = err;
  } else {
    rval = {
      showStack: false,
      toString: (): string => {
        return '';
      },
    } as unknown as Error;
    logger.markErrorAsWritten(rval);
  }
  return rval as Error;
};

function executeTask(taskExecutable: ExecutableTask<unknown>, localContext: BuildContext): Promise<void> {
  if (taskExecutable && !taskExecutable.execute) {
    if ((taskExecutable as any).default) {
      taskExecutable = (taskExecutable as any).default;
    }
  }

  // If the task is missing, throw a meaningful error.
  if (!taskExecutable || !taskExecutable.execute) {
    return Promise.reject(
      new Error(`A task was scheduled, but the task was null. This probably means the task wasn't imported correctly.`),
    );
  }

  if (taskExecutable.isEnabled === undefined || taskExecutable.isEnabled(localContext.buildConfig)) {
    const startTime: [number, number] = process.hrtime();

    if (localContext.buildConfig.onTaskStart && taskExecutable.name) {
      localContext.buildConfig.onTaskStart(taskExecutable.name);
    }

    const taskPromise: Promise<void> = taskExecutable
      .execute(localContext)
      .then(() => {
        if (localContext.buildConfig.onTaskEnd && taskExecutable.name) {
          localContext.buildConfig.onTaskEnd(taskExecutable.name, process.hrtime(startTime));
        }
      })
      .catch((promiseError: Error) => {
        if (localContext.buildConfig.onTaskEnd && taskExecutable.name) {
          localContext.buildConfig.onTaskEnd(taskExecutable.name, process.hrtime(startTime), promiseError);
        }
        return Promise.reject(promiseError);
      });

    return taskPromise;
  }

  // No-op otherwise.
  return Promise.resolve();
}

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

function handleCommandLineArguments(): void {
  handleTasksListArguments();
}

function handleTasksListArguments(): void {
  if (args['tasks'] || args['tasks-simple'] || args['T']) {
    global['dontWatchExit'] = true;
  }
  if (args['h']) {
    // we are showing a help command prompt via yargs or ts-command-line
    global['dontWatchExit'] = true;
  }
}

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
