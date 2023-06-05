import prettyTime from 'pretty-hrtime';
import { RELOG_ISSUES_FLAG } from '../Constants';
import { IOUtils, duration, error, failure, info, success, warn } from '../support';
import { BuildContext, BuildContextState, BuildState, Callback } from '../types';

type LogFunction = (...args: string[]) => void;

export class BuildSummary {
  private readonly log: LogFunction;
  private readonly contextState: BuildContextState;

  public constructor(private readonly context: BuildContext, private readonly state: BuildState) {
    this.log = context.logger.log;
    this.contextState = context.state;
  }

  public write(callback: Callback): void {
    this.context.writeSummaryCallbacks.push(callback);

    if (!this.contextState.writingSummary) {
      this.contextState.writingSummary = true;

      IOUtils.afterStreamsFlushed(this.contextState.duringFastExit, () => {
        this.log(duration('==================[ Finished ]=================='));

        this.relogIssues();

        IOUtils.afterStreamsFlushed(this.contextState.duringFastExit, () => {
          this.logSummaries();
          this.logContextInfo();
          this.logTestResults();
          this.logCoverageResults();
          this.logWarnings();
          this.logErrors();

          this.contextState.wroteSummary = true;

          this.doWriteSumaryCallbacks();

          const callbacks: Callback[] = this.context.writeSummaryCallbacks;
          this.context.writeSummaryCallbacks = [];
          callbacks.forEach((writeSummaryCallback) => writeSummaryCallback());
        });
      });
    } else if (this.contextState.wroteSummary) {
      this.doWriteSumaryCallbacks();
    }
  }

  private relogIssues(): void {
    const shouldRelogIssues: boolean = this.state.getFlagValue(RELOG_ISSUES_FLAG);
    if (shouldRelogIssues) {
      this.context.warnings.forEach((warning) => {
        console.error(warn(warning));
      });
    }

    if (shouldRelogIssues && (this.context.metrics.taskErrors > 0 || this.context.errors.length)) {
      this.context.errors.forEach((err) => {
        console.error(error(err));
      });
    }
  }

  private logSummaries(): void {
    this.context.writeSummaryLogs.forEach((summary) => this.log(summary));
  }

  private logContextInfo(): void {
    const totalDuration: [number, number] = process.hrtime(this.context.metrics.start);
    const name: string = this.state.builtPackage.name || 'with unknown name';
    const version: string = this.state.builtPackage.version || 'unknown';
    this.log(`Project ${name} version:`, info(version));

    const toolVersion =
      this.state.toolPackage && this.state.toolPackage.version ? this.state.toolPackage.version : 'unknown';
    this.log('Build tools version:', info(toolVersion));

    this.log('Node version:', info(process.version));
    this.log('Total duration:', info(prettyTime(totalDuration)));
  }

  private logTestResults(): void {
    if (this.context.metrics.testsRun > 0) {
      this.log(
        'Tests results -',
        'Passed:',
        success(`${this.context.metrics.testsPassed}`),
        'Failed:',
        failure(`${this.context.metrics.testsFailed}`),
        'Skipped:',
        warn(`${this.context.metrics.testsSkipped}`),
      );
    }
  }

  private logCoverageResults(): void {
    if (this.context.metrics.coverageResults > 0) {
      this.log(
        'Coverage results -',
        'Passed:',
        success(`${this.context.metrics.coveragePass}`),
        'Failed:',
        failure(`${this.context.metrics.coverageResults - this.context.metrics.coveragePass}`),
        'Avg. Cov.:',
        info(`${Math.floor(this.context.metrics.coverageTotal / this.context.metrics.coverageResults)}%`),
      );
    }
  }

  private logWarnings(): void {
    if (this.context.warnings.length) {
      this.log('Task warnings:', warn(`${this.context.warnings.length.toString()}`));
    }
  }

  private logErrors(): void {
    let totalErrors = 0;
    if (this.context.metrics.taskErrors > 0 || this.context.errors.length) {
      totalErrors = this.context.metrics.taskErrors + this.context.errors.length;
      this.log('Task errors:', error(`${totalErrors}`));
    }
  }

  private doWriteSumaryCallbacks(): void {
    const callbacks: Callback[] = this.context.writeSummaryCallbacks;
    this.context.writeSummaryCallbacks = [];
    callbacks.forEach((writeSummaryCallback) => writeSummaryCallback());
  }
}
