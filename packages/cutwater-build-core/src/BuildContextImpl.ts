import { Gulp } from 'gulp';
import { BuildSummary, Logger } from './logging';
import { BuildConfig, BuildContext, BuildContextState, BuildMetrics, BuildState } from './types';

export class BuildContextImpl implements BuildContext {
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

  public static create(state: BuildState, buildConfig: BuildConfig, logger: Logger): BuildContext {
    return new BuildContextImpl(state, buildConfig, logger);
  }

  private constructor(private readonly buildState: BuildState, config: BuildConfig, logger: Logger) {
    this.buildConfig = config;
    this.gulp = config.gulp;
    this.logger = logger;
    this.wireUpProcessErrorHandling();
  }

  private wireUpProcessErrorHandling(): void {
    if (!this.state.wiredUpErrorHandling) {
      this.state.wiredUpErrorHandling = true;

      const wroteToStdErr = false;
      const summary = new BuildSummary(this, this.buildState);

      process.on('exit', (code: number) => {
        this.state.duringFastExit = true;
        if (!global['dontWatchExit']) {
          if (!this.state.wroteSummary) {
            summary.write(() => {
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
        summary.write(() => {
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
