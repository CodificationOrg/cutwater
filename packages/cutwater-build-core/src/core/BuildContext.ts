import { join, resolve } from 'path/win32';
import { Logger } from '../logging';
import { MonorepoMetadata } from '../support';
import { isJestEnabled } from '../tasks';
import { BuildConfig, BuildContextState, BuildMetrics } from '../types';
import { BuildState } from './BuildState';
import { BuildSummary } from './BuildSummary';
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
import { System } from './System';

export class BuildContext {
  private static generateBaseBuildConfig(state: BuildState): BuildConfig {
    const packageFolder =
      state.builtPackage.directories && state.builtPackage.directories.packagePath
        ? state.builtPackage.directories.packagePath
        : '';
    return {
      gulp: undefined as any,
      rootPath: state.system.cwd(),
      maxBuildTimeMs: 0,
      packageFolder,
      srcFolder: 'src',
      distFolder: join(packageFolder, DIST_FOLDER),
      libFolder: join(packageFolder, LIB_FOLDER),
      tempFolder: join(packageFolder, TEMP_FOLDER),
      properties: {},
      uniqueTasks: [],
      relogIssues: state.getFlagValue(RELOG_ISSUES_FLAG, true),
      showToast: state.getFlagValue(SHOW_TOAST_FLAG, true),
      verbose: state.getFlagValue(VERBOSE_FLAG, false),
      production: state.getFlagValue(PRODUCTION_FLAG, false),
      args: state.args,
      shouldWarningsFailBuild: false,
    };
  }

  private static findLockFileName(system: System, repoMetadata?: MonorepoMetadata): string | undefined {
    const basePath = repoMetadata ? repoMetadata.rootPath : resolve(system.cwd());
    return LOCK_FILES.find((lockFile) => system.fileExists(resolve(basePath, lockFile)));
  }

  public static createNull(
    buildConfig?: BuildConfig,
    state: BuildState = BuildState.createNull(),
    logger: Logger = Logger.createNull(),
  ): BuildContext {
    const baseBuildConfig = BuildContext.generateBaseBuildConfig(state);
    const repoMetadata = MonorepoMetadata.createNull(baseBuildConfig.rootPath, state.system);
    const lockFile = BuildContext.findLockFileName(state.system, repoMetadata);
    const npmClient = lockFile ? LOCK_FILE_MAPPING[lockFile] : undefined;

    const config: BuildConfig = {
      ...baseBuildConfig,
      repoMetadata,
      lockFile,
      npmClient,
      jestEnabled: isJestEnabled(baseBuildConfig.rootPath, state.system),
    };
    return new BuildContext(buildConfig || config, logger, state);
  }

  public static create(): BuildContext {
    const state = BuildState.create();
    const baseBuildConfig = BuildContext.generateBaseBuildConfig(state);
    const repoMetadata = MonorepoMetadata.create(baseBuildConfig.rootPath);
    const lockFile = BuildContext.findLockFileName(state.system, repoMetadata);
    const npmClient = lockFile ? LOCK_FILE_MAPPING[lockFile] : undefined;

    const buildConfig: BuildConfig = {
      ...baseBuildConfig,
      repoMetadata,
      lockFile,
      npmClient,
      jestEnabled: isJestEnabled(baseBuildConfig.rootPath, state.system),
      buildSuccessIconPath: resolve(__dirname, SUCCESS_ICON),
      buildErrorIconPath: resolve(__dirname, FAIL_ICON),
    };
    return new BuildContext(buildConfig, Logger.create(), state);
  }

  public warnings: string[] = [];
  public errors: string[] = [];
  public metrics: BuildMetrics = {
    taskRun: 0,
    subTasksRun: 0,
    testsRun: 0,
    testsPassed: 0,
    testsFailed: 0,
    testsFlakyFailed: 0,
    testsSkipped: 0,
    taskErrors: 0,
    coverageResults: 0,
    coveragePass: 0,
    coverageTotal: 0,
    totalTaskSrc: 0,
    totalTaskHrTime: undefined,
  };
  public state: BuildContextState = {
    wroteSummary: false,
    writingSummary: false,
    wiredUpErrorHandling: false,
    duringFastExit: false,
  };
  public writeSummaryCallbacks: Array<() => void> = [];
  public exitCode = 0;
  public writeSummaryLogs: string[] = [];
  public gulpErrorCallback: undefined | ((err: Error) => void) = undefined;
  public gulpStopCallback: undefined | ((err: Error) => void) = undefined;
  public errorAndWarningSuppressions: Array<string | RegExp> = [];
  public shouldLogWarningsDuringSummary = false;
  public shouldLogErrorsDuringSummary = false;

  constructor(public buildConfig: BuildConfig, public readonly logger: Logger, public readonly buildState: BuildState) {
    this.wireUpProcessErrorHandling();
  }

  private wireUpProcessErrorHandling(): void {
    const { system } = this.buildState;
    if (!this.state.wiredUpErrorHandling) {
      this.state.wiredUpErrorHandling = true;

      const wroteToStdErr = false;
      system.on('exit', (code: number) => {
        this.state.duringFastExit = true;
        if (!global['dontWatchExit']) {
          if (!this.state.wroteSummary) {
            new BuildSummary(this, this.buildState).write(() => {
              this.exitProcess(code);
            });
          } else {
            if (code !== 0) {
              this.logger.log(`Exiting with exit code: ${code}`);
              this.exitProcess(code);
            } else if (wroteToStdErr) {
              this.logger.error(`The build failed because a task wrote output to stderr.`);
              this.logger.log(`Exiting with exit code: 1`);
              this.exitProcess(code);
            }
          }
        }
      });

      system.on('uncaughtException', (err: Error) => {
        this.logger.writeTaskError(err);
        this.metrics.taskErrors++;
        new BuildSummary(this, this.buildState).write(() => {
          this.exitProcess(1);
          if (this.gulpErrorCallback) {
            this.gulpErrorCallback(err);
          }
        });
      });
    }
  }

  private exitProcess(errorCode: number): void {
    const { system } = this.buildState;
    if (!this.state.watchMode) {
      system.stdout.write('', () => {
        this.buildState.system.exit(errorCode);
      });
    }
  }
}
