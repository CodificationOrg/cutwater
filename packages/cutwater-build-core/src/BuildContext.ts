import { Gulp } from 'gulp';

import { BuildConfig } from './BuildConfig';
import { BuildSummary } from './logging/BuildSummary';
import { Logger } from './logging/Logger';

export interface BuildMetrics {
  start?: [number, number];
  coverageResults: number;
  coveragePass: number;
  coverageTotal: number;
  testsRun: number;
  testsPassed: number;
  testsFailed: number;
  testsFlakyFailed: number;
  testsSkipped: number;
  taskRun: number;
  subTasksRun: number;
  taskErrors: number;
  totalTaskSrc: number;
  totalTaskHrTime: [number, number] | undefined;
  taskCreationTime?: [number, number];
}

export interface BuildState {
  wroteSummary: boolean;
  writingSummary: boolean;
  watchMode?: boolean;
  fromRunGulp?: boolean;
  wiredUpErrorHandling: boolean;
  duringFastExit: boolean;
}

export interface BuildContext {
  logger: Logger;
  warnings: string[];
  errors: string[];
  metrics: BuildMetrics;
  state: BuildState;
  writeSummaryCallbacks: Array<() => void>;
  exitCode: number;
  writeSummaryLogs: string[];
  buildConfig: BuildConfig;
  gulp: Gulp;
  gulpErrorCallback: undefined | ((err: Error) => void);
  gulpStopCallback: undefined | ((err: Error) => void);
  errorAndWarningSuppressions: Array<string | RegExp>;
  shouldLogWarningsDuringSummary: boolean;
  shouldLogErrorsDuringSummary: boolean;
}

export const createContext = (buildConfig: BuildConfig, localGulp: Gulp, logger: Logger): BuildContext => {
  return new BuildContextImpl(buildConfig, localGulp, logger);
};

class BuildContextImpl implements BuildContext {
  public buildConfig: BuildConfig;
  public readonly gulp: Gulp;
  public readonly logger: Logger;
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
  public state: BuildState = {
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

  public constructor(config: BuildConfig, localGulp: Gulp, logger: Logger) {
    this.buildConfig = config;
    this.gulp = localGulp || config.gulp;
    this.logger = logger;
    this.wireUpProcessErrorHandling();
  }

  private wireUpProcessErrorHandling(): void {
    if (!this.state.wiredUpErrorHandling) {
      this.state.wiredUpErrorHandling = true;

      const wroteToStdErr = false;

      process.on('exit', (code: number) => {
        this.state.duringFastExit = true;
        if (!global['dontWatchExit']) {
          if (!this.state.wroteSummary) {
            BuildSummary.write(this, () => {
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

      process.on('uncaughtException', (err: Error) => {
        this.logger.writeTaskError(err);
        this.metrics.taskErrors++;
        BuildSummary.write(this, () => {
          this.exitProcess(1);
          if (this.gulpErrorCallback) {
            this.gulpErrorCallback(err);
          }
        });
      });
    }
  }

  private exitProcess(errorCode: number): void {
    if (!this.state.watchMode) {
      process.stdout.write('', () => {
        process.exit(errorCode);
      });
    }
  }
}
