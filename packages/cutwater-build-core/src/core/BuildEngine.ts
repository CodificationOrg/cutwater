import { existsSync } from 'fs';
import { Gulp } from 'gulp';
import { join, resolve } from 'path';
import { Logger } from '../logging';
import { MonorepoMetadata } from '../support';
import { isJestEnabled } from '../tasks';
import { BuildConfig, Callback, ExecutableTask } from '../types';
import { BuildContext, createBuildContext } from './BuildContextImpl';
import { BuildState, getBuildState } from './BuildState';
import {
  DIST_FOLDER,
  FAIL_ICON,
  LIB_FOLDER,
  LOCK_FILES,
  LOCK_FILE_MAPPING,
  PRODUCTION_FLAG,
  RELOG_ISSUES_FLAG,
  SHOW_TOAST_FLAG,
  SUCCESS_ICON,
  TEMP_FOLDER,
  VERBOSE_FLAG,
} from './Constants';

export class BuildEngine {
  private readonly state: BuildState;
  private readonly taskMap: Record<string, ExecutableTask<unknown>> = {};
  private readonly uniqueTasks: ExecutableTask<unknown>[] = [];
  private readonly packageFolder: string;
  private readonly logger: Logger;
  private readonly buildContext: BuildContext;

  public constructor() {
    this.state = getBuildState();
    this.packageFolder =
      this.state.builtPackage.directories && this.state.builtPackage.directories.packagePath
        ? this.state.builtPackage.directories.packagePath
        : '';
    this.logger = Logger.create(this.state.getFlagValue(VERBOSE_FLAG));

    const rootPath = process.cwd();
    const buildConfig: BuildConfig = {
      gulp: undefined as any,
      rootPath,
      maxBuildTimeMs: 0,
      jestEnabled: isJestEnabled(rootPath),
      packageFolder: this.packageFolder,
      srcFolder: 'src',
      distFolder: join(this.packageFolder, DIST_FOLDER),
      libFolder: join(this.packageFolder, LIB_FOLDER),
      tempFolder: join(this.packageFolder, TEMP_FOLDER),
      properties: {},
      uniqueTasks: this.uniqueTasks,
      relogIssues: this.state.getFlagValue(RELOG_ISSUES_FLAG, true),
      showToast: this.state.getFlagValue(SHOW_TOAST_FLAG, true),
      buildSuccessIconPath: resolve(__dirname, SUCCESS_ICON),
      buildErrorIconPath: resolve(__dirname, FAIL_ICON),
      verbose: this.state.getFlagValue(VERBOSE_FLAG, false),
      production: this.state.getFlagValue(PRODUCTION_FLAG, false),
      args: this.state.args,
      shouldWarningsFailBuild: false,
    };
    this.buildContext = createBuildContext(buildConfig, this.logger, this.state);
  }

  private static findLockFileName(repoMetadata?: MonorepoMetadata): string | undefined {
    const basePath = repoMetadata ? repoMetadata.rootPath : resolve(process.cwd());
    return LOCK_FILES.find((lockFile) => existsSync(resolve(basePath, lockFile)));
  }

  private handleCommandLineArguments(): void {
    this.handleTasksListArguments();
  }

  private handleTasksListArguments(): void {
    const { args } = this.buildContext.buildConfig;
    if (args['tasks'] || args['tasks-simple'] || args['T']) {
      global['dontWatchExit'] = true;
    }
    if (args['h']) {
      // we are showing a help command prompt via yargs or ts-command-line
      global['dontWatchExit'] = true;
    }
  }

  private generateGulpError(err: Error): Error {
    const { logger } = this.buildContext;
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
  }

  private validateTaskExecutable(taskExecutable: ExecutableTask<unknown>): ExecutableTask<unknown> {
    let rval: ExecutableTask<unknown> = taskExecutable;
    if (rval && !rval.execute) {
      if ((rval as any).default) {
        rval = (rval as any).default;
      }
    }

    // If the task is missing, throw a meaningful error.
    if (!rval || !rval.execute) {
      throw new Error(
        `A task was scheduled, but the task was null. This probably means the task wasn't imported correctly.`,
      );
    }
    return rval;
  }

  private isEnabled(taskExecutable: ExecutableTask<unknown>): boolean {
    return taskExecutable.isEnabled === undefined || taskExecutable.isEnabled(this.buildContext.buildConfig);
  }

  private triggerOnTaskStart(taskExecutable: ExecutableTask<unknown>): void {
    const { buildConfig } = this.buildContext;
    if (buildConfig.onTaskStart && taskExecutable.name) {
      buildConfig.onTaskStart(taskExecutable.name);
    }
  }

  private triggerOnTaskEnd(taskExecutable: ExecutableTask<unknown>, startTime: [number, number], err?: Error): void {
    const { buildConfig } = this.buildContext;
    if (buildConfig.onTaskEnd && taskExecutable.name) {
      buildConfig.onTaskEnd(taskExecutable.name, process.hrtime(startTime), err);
    }
  }

  public async executeTask(taskExecutable: ExecutableTask<unknown>): Promise<void> {
    const task = this.validateTaskExecutable(taskExecutable);
    if (this.isEnabled(task)) {
      const startTime: [number, number] = process.hrtime();
      this.triggerOnTaskStart(task);
      try {
        await task.execute(this.buildContext);
        this.triggerOnTaskEnd(task, startTime);
      } catch (err) {
        this.triggerOnTaskEnd(task, startTime, err);
        throw err;
      }
    }
  }

  private maxBuildTimeMs(taskExecutable: ExecutableTask<unknown>): number {
    const { maxBuildTimeMs } = this.buildContext.buildConfig;
    return taskExecutable.maxBuildTimeMs === undefined ? maxBuildTimeMs : taskExecutable.maxBuildTimeMs;
  }

  private toTaskTimer(taskExecutable: ExecutableTask<unknown>, callback: Callback): NodeJS.Timer | undefined {
    const maxBuildTimeMs = this.maxBuildTimeMs(taskExecutable);
    if (maxBuildTimeMs === 0) {
      return undefined;
    }
    const { logger } = this.buildContext;
    return setTimeout(() => {
      logger.error(`Build ran for ${maxBuildTimeMs} milliseconds without completing. Cancelling build with error.`);
      callback(new Error('Timeout'));
    }, maxBuildTimeMs);
  }

  private registerTask(taskName: string, taskExecutable: ExecutableTask<unknown>): void {
    const { buildConfig } = this.buildContext;
    const { gulp } = buildConfig;

    gulp.task(taskName, async (callback) => {
      const timer = this.toTaskTimer(taskExecutable, callback);
      try {
        await this.executeTask(taskExecutable);
        if (timer) {
          clearTimeout(timer);
        }
        callback();
      } catch (err) {
        if (timer) {
          clearTimeout(timer);
        }
        callback(this.generateGulpError(err));
      }
    });
  }

  private trackTask(taskExecutable: ExecutableTask<unknown>): void {
    if (this.uniqueTasks.indexOf(taskExecutable) < 0) {
      this.uniqueTasks.push(taskExecutable);
    }
  }

  private flatten<T>(oArr: Array<T | T[]>): T[] {
    const rval: T[] = [];

    const traverse = (arr: Array<T | T[]>): void => {
      arr.forEach((el) => {
        if (Array.isArray(el)) {
          traverse(el as T[]);
        } else {
          rval.push(el as T);
        }
      });
    };

    traverse(oArr);
    return rval;
  }

  public task(taskName: string, taskExecutable: ExecutableTask<unknown>): ExecutableTask<unknown> {
    this.taskMap[taskName] = taskExecutable;
    this.trackTask(taskExecutable);
    return taskExecutable;
  }

  public serial(...tasks: Array<ExecutableTask<unknown>[] | ExecutableTask<unknown>>): ExecutableTask<unknown> {
    const flatTasks: ExecutableTask<unknown>[] = this.flatten(tasks).filter((taskExecutable) => {
      return taskExecutable !== null && taskExecutable !== undefined;
    }) as ExecutableTask<unknown>[];
    flatTasks.forEach((task) => this.trackTask(task));
    return {
      execute: async (): Promise<void> => {
        for (const taskExecutable of flatTasks) {
          await this.executeTask(taskExecutable);
        }
      },
    };
  }

  public parallel(...tasks: Array<ExecutableTask<unknown>[] | ExecutableTask<unknown>>): ExecutableTask<void> {
    const flatTasks: ExecutableTask<unknown>[] = this.flatten<ExecutableTask<unknown>>(tasks).filter(
      (taskExecutable) => {
        return taskExecutable !== null && taskExecutable !== undefined;
      },
    );
    flatTasks.forEach((task) => this.trackTask(task));
    return {
      execute: async (): Promise<void> => {
        await Promise.all<void>(flatTasks.map((task) => this.executeTask(task)));
      },
    };
  }

  public getConfig(): BuildConfig {
    return this.buildContext.buildConfig;
  }

  public setConfig(config: Partial<BuildConfig>): void {
    this.buildContext.buildConfig = { ...this.getConfig(), ...config };
  }

  public replaceConfig(config: BuildConfig): void {
    this.buildContext.buildConfig = config;
  }

  public initialize(localGulp: Gulp): void {
    const { taskMap, uniqueTasks, buildContext } = this;
    const { buildConfig } = this.buildContext;

    buildConfig.gulp = localGulp;
    buildConfig.repoMetadata = MonorepoMetadata.findRepoRootPath(process.cwd()) ? MonorepoMetadata.create() : undefined;
    buildConfig.lockFile = BuildEngine.findLockFileName(buildConfig.repoMetadata);
    buildConfig.npmClient = buildConfig.lockFile ? LOCK_FILE_MAPPING[buildConfig.lockFile] : undefined;

    this.handleCommandLineArguments();

    for (const uniqueTask of uniqueTasks || []) {
      if (uniqueTask.onRegister) {
        uniqueTask.onRegister();
      }
    }

    if (!buildContext.metrics.start) {
      buildContext.metrics.start = process.hrtime();
    }

    Object.keys(taskMap).forEach((taskName) => this.registerTask(taskName, taskMap[taskName]));
    buildContext.metrics.taskCreationTime = process.hrtime(this.buildContext.metrics.start);
  }
}
