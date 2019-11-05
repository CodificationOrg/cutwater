if (process.argv.indexOf('--no-color') === -1) {
  process.argv.push('--color');
}

import { Gulp } from 'gulp';
import * as path from 'path';
import { BuildConfig } from './BuildConfig';
import { BuildContext, createContext } from './BuildContext';
import { ExecutableTask } from './ExecutableTask';
import { getLogger, Logger } from './logging/Logger';
import { args, builtPackage, getFlagValue } from './State';
import { CleanFlagTask } from './tasks/CleanFlagTask';
import { CleanTask } from './tasks/CleanTask';
import { CopyStaticAssetsTask } from './tasks/CopyStaticAssetsTask';
import { GulpTask } from './tasks/GulpTask';
import { isJestEnabled, JestTask } from './tasks/JestTask';
import { PrettierTask } from './tasks/PrettierTask';

export { BuildConfig } from './BuildConfig';
export { BuildContext, BuildMetrics, BuildState } from './BuildContext';
export { ExecutableTask } from './ExecutableTask';
export { Logger } from './logging/Logger';
export * from './tasks';
export { IOUtils } from './utilities/IOUtils';

const taskMap: { [key: string]: ExecutableTask } = {};
const uniqueTasks: ExecutableTask[] = [];

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
  distFolder: path.join(packageFolder, 'dist'),
  libAMDFolder: undefined,
  libESNextFolder: undefined,
  libFolder: path.join(packageFolder, 'lib'),
  tempFolder: 'temp',
  properties: {},
  relogIssues: getFlagValue('relogIssues', true),
  showToast: getFlagValue('showToast', true),
  buildSuccessIconPath: path.resolve(__dirname, 'pass.png'),
  buildErrorIconPath: path.resolve(__dirname, 'fail.png'),
  verbose: getFlagValue('verbose', false),
  production: getFlagValue('production', false),
  args,
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

export const cleanFlag: ExecutableTask = new CleanFlagTask();

export function task(taskName: string, taskExecutable: ExecutableTask): ExecutableTask {
  taskExecutable = serial(cleanFlag, taskExecutable);
  taskMap[taskName] = taskExecutable;
  trackTask(taskExecutable);
  return taskExecutable;
}

export type CustomGulpTask = (
  gulp: Gulp,
  buildConfig: BuildConfig,
  done?: (failure?: string | Error) => void,
) => Promise<object> | NodeJS.ReadWriteStream | void;

class CustomTask extends GulpTask<void> {
  private customTask: CustomGulpTask;
  constructor(name: string, fn: CustomGulpTask) {
    super(name);
    this.customTask = fn.bind(this);
  }

  public executeTask(
    localGulp: Gulp,
    completeCallback?: (error?: string | Error) => void,
  ): Promise<object> | NodeJS.ReadWriteStream | void {
    return this.customTask(localGulp, getConfig(), completeCallback);
  }
}

export function subTask(taskName: string, fn: CustomGulpTask): ExecutableTask {
  const customTask: CustomTask = new CustomTask(taskName, fn);
  return customTask;
}

export function serial(...tasks: Array<ExecutableTask[] | ExecutableTask>): ExecutableTask {
  const flatTasks: ExecutableTask[] = flatten(tasks).filter(taskExecutable => {
    return taskExecutable !== null && taskExecutable !== undefined;
  }) as ExecutableTask[];

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
export function parallel(...tasks: Array<ExecutableTask[] | ExecutableTask>): ExecutableTask {
  const flatTasks: ExecutableTask[] = flatten<ExecutableTask>(tasks).filter(taskExecutable => {
    return taskExecutable !== null && taskExecutable !== undefined;
  });

  for (const flatTask of flatTasks) {
    trackTask(flatTask);
  }

  return {
    execute: (localContext: BuildContext): Promise<any> => {
      return new Promise<void[]>((resolve, reject) => {
        const promises: Array<Promise<void>> = [];
        for (const taskExecutable of flatTasks) {
          promises.push(executeTask(taskExecutable, localContext));
        }

        // Use promise all to make sure errors are propagated correctly
        Promise.all<void>(promises).then(resolve, reject);
      });
    },
  };
}

export function initialize(localGulp: Gulp): void {
  buildContext = createContext(buildConfig, localGulp, logger);

  getConfig().rootPath = process.cwd();
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

  Object.keys(taskMap).forEach(taskName => registerTask(buildContext, taskName, taskMap[taskName]));

  buildContext.metrics.taskCreationTime = process.hrtime(buildContext.metrics.start);
}

const registerTask = (localContext: BuildContext, taskName: string, taskExecutable: ExecutableTask): void => {
  localContext.gulp.task(taskName, cb => {
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
    executeTask(taskExecutable, localContext).then(
      () => {
        if (timer) {
          clearTimeout(timer);
        }

        cb();
      },
      (executionError: Error) => {
        if (timer) {
          clearTimeout(timer);
        }

        cb(generateGulpError(executionError));
      },
    );
  });
};

const generateGulpError = (err: object): object => {
  let rval: object;
  if (logger.isVerboseEnabled()) {
    rval = err;
  } else {
    rval = {
      showStack: false,
      toString: (): string => {
        return '';
      },
    };
    logger.markErrorAsWritten(rval as Error);
  }
  return rval;
};

function executeTask(taskExecutable: ExecutableTask, localContext: BuildContext): Promise<void> {
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

    const taskPromise: Promise<void> = taskExecutable.execute(localContext).then(
      () => {
        if (localContext.buildConfig.onTaskEnd && taskExecutable.name) {
          localContext.buildConfig.onTaskEnd(taskExecutable.name, process.hrtime(startTime));
        }
      },
      (promiseError: Error) => {
        if (localContext.buildConfig.onTaskEnd && taskExecutable.name) {
          localContext.buildConfig.onTaskEnd(taskExecutable.name, process.hrtime(startTime), promiseError);
        }

        return Promise.reject(promiseError);
      },
    );

    return taskPromise;
  }

  // No-op otherwise.
  return Promise.resolve();
}

function trackTask(taskExecutable: ExecutableTask): void {
  if (uniqueTasks.indexOf(taskExecutable) < 0) {
    uniqueTasks.push(taskExecutable);
  }
}

function flatten<T>(oArr: Array<T | T[]>): T[] {
  const output: T[] = [];

  function traverse(arr: Array<T | T[]>): void {
    arr.forEach(el => {
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
  /* tslint:disable:no-string-literal */
  if (args['tasks'] || args['tasks-simple'] || args['T']) {
    global['dontWatchExit'] = true;
  }
  if (args['h']) {
    // we are showing a help command prompt via yargs or ts-command-line
    global['dontWatchExit'] = true;
  }
  /* tslint:enable:no-string-literal */
}

export const clean: ExecutableTask = new CleanTask();
export const prettier: ExecutableTask = new PrettierTask();
export const copyStaticAssets: CopyStaticAssetsTask = new CopyStaticAssetsTask();
export const jest: JestTask = new JestTask();

task('clean', clean);
task('jest', jest);
task('prettier', prettier);
