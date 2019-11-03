import * as colors from 'colors';
import * as gulp from 'gulp';
import * as prettyTime from 'pretty-hrtime';

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
  gulp: gulp.Gulp;
  gulpErrorCallback: undefined | ((err: object) => void);
  gulpStopCallback: undefined | ((err: object) => void);
  errorAndWarningSuppressions: Array<string | RegExp>;
  shouldLogWarningsDuringSummary: boolean;
  shouldLogErrorsDuringSummary: boolean;
}

export const createContext = (buildConfig: BuildConfig, localGulp: gulp.Gulp, logger: Logger): BuildContext => {
  return new BuildContextImpl(buildConfig, localGulp, logger);
};

// tslint:disable: no-console

class BuildContextImpl implements BuildContext {
  public buildConfig: BuildConfig;
  public readonly gulp: gulp.Gulp;
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
  public exitCode: number = 0;
  public writeSummaryLogs: string[] = [];
  public gulpErrorCallback: undefined | ((err: object) => void) = undefined;
  public gulpStopCallback: undefined | ((err: object) => void) = undefined;
  public errorAndWarningSuppressions: Array<string | RegExp> = [];
  public shouldLogWarningsDuringSummary: boolean = false;
  public shouldLogErrorsDuringSummary: boolean = false;

  public constructor(config: BuildConfig, localGulp: gulp.Gulp, logger: Logger) {
    this.buildConfig = config;
    this.gulp = localGulp || config.gulp;
    this.logger = logger;

    this.initialize();
  }

  private initialize(): void {
    this.wireUpProcessErrorHandling(this.buildConfig.shouldWarningsFailBuild);

    this.gulp.on('start', (err: object) => {
      this.logger.log('Starting gulp');
    });

    this.gulp.on('stop', (err: object) => {
      BuildSummary.write(this, () => {
        // error if we have any errors
        if (
          this.metrics.taskErrors > 0 ||
          (this.warnings.length && this.buildConfig.shouldWarningsFailBuild) ||
          this.errors.length ||
          this.metrics.testsFailed > 0
        ) {
          this.exitProcess(1);
        }

        if (this.gulpStopCallback) {
          this.gulpStopCallback(err);
        }
        this.exitProcess(0);
      });
    });

    this.gulp.on('err', (err: object) => {
      this.logger.writeTaskError(err);
      this.metrics.taskErrors++;
      BuildSummary.write(this, () => {
        this.exitProcess(1);
        if (this.gulpErrorCallback) {
          this.gulpErrorCallback(err);
        }
      });
    });

    this.gulp.on('task_stop', (e: any) => {
      const time: string = prettyTime(e.hrDuration);

      if (this.state.fromRunGulp) {
        this.logger.log('Finished', "'" + colors.cyan(e.task) + "'", 'after', colors.magenta(time));
      }
    });

    this.gulp.on('task_err', (err: any) => {
      this.logger.writeTaskError(err);
      this.metrics.taskErrors++;
      BuildSummary.write(this, () => {
        this.exitProcess(1);
      });
    });

    this.gulp.on('task_not_found', (err: any) => {
      this.logger.log(colors.red("Task '" + err.task + "' is not in your gulpfile"));
      this.logger.log('Please check the documentation for proper gulpfile formatting');
    });
  }

  private wireUpProcessErrorHandling(shouldWarningsFailBuild: boolean): void {
    if (!this.state.wiredUpErrorHandling) {
      this.state.wiredUpErrorHandling = true;

      let wroteToStdErr: boolean = false;

      if (shouldWarningsFailBuild) {
        const oldStdErr = process.stderr.write;
        process.stderr.write = (text: string | Buffer): boolean => {
          if (!!text.toString()) {
            wroteToStdErr = true;
            return oldStdErr.apply(process.stderr);
          }
          return true;
        };
      }

      process.on('exit', (code: number) => {
        this.state.duringFastExit = true;
        // tslint:disable-next-line: no-string-literal
        if (!global['dontWatchExit']) {
          // tslint:disable-line:no-string-literal
          if (!this.state.wroteSummary) {
            this.state.wroteSummary = true;
            console.log('About to exit with code:', code);
            console.error(
              'Process terminated before summary could be written, possible error in async code not ' + 'continuing!',
            );
            console.log('Trying to exit with exit code 1');
            this.exitProcess(1);
          } else {
            if (this.exitCode !== 0) {
              console.log(`Exiting with exit code: ${this.exitCode}`);
              this.exitProcess(this.exitCode);
            } else if (wroteToStdErr) {
              console.error(`The build failed because a task wrote output to stderr.`);
              console.log(`Exiting with exit code: 1`);
              this.exitProcess(1);
            }
          }
        }
      });

      process.on('uncaughtException', (err: Error) => {
        console.error(err);

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
