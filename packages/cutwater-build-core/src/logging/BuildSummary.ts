import { default as prettyTime } from 'pretty-hrtime';
import { BuildContext } from '../BuildContext';
import { builtPackage, coreBuildPackage, getFlagValue } from '../State';
import { duration, error, failure, info, success, warn } from '../support/ColorUtils';
import { IOUtils } from '../support/IOUtils';

type LogFunction = (...args: string[]) => void;

export class BuildSummary {
  public static write(context: BuildContext, callback: () => void): void {
    const log: LogFunction = context.logger.log;
    context.writeSummaryCallbacks.push(callback);

    if (!context.state.writingSummary) {
      context.state.writingSummary = true;

      IOUtils.afterStreamsFlushed(context.state.duringFastExit, () => {
        log(duration('==================[ Finished ]=================='));

        this.relogIssues(context);

        IOUtils.afterStreamsFlushed(context.state.duringFastExit, () => {
          this.logSummaries(context, log);
          this.logContextInfo(context, log);
          this.logTestResults(context, log);
          this.logCoverageResults(context, log);
          this.logWarnings(context, log);
          this.logErrors(context, log);

          context.state.wroteSummary = true;

          this.doWriteSumaryCallbacks(context);

          const callbacks: Array<() => void> = context.writeSummaryCallbacks;
          context.writeSummaryCallbacks = [];
          callbacks.forEach((writeSummaryCallback) => writeSummaryCallback());
        });
      });
    } else if (context.state.wroteSummary) {
      this.doWriteSumaryCallbacks(context);
    }
  }

  private static relogIssues(context: BuildContext): void {
    const shouldRelogIssues: boolean = getFlagValue('relogIssues');
    if (shouldRelogIssues) {
      context.warnings.forEach((warning) => {
        console.error(warn(warning));
      });
    }

    if (shouldRelogIssues && (context.metrics.taskErrors > 0 || context.errors.length)) {
      context.errors.forEach((err) => {
        console.error(error(err));
      });
    }
  }

  private static logSummaries(context: BuildContext, log: LogFunction): void {
    context.writeSummaryLogs.forEach((summary) => log(summary));
  }

  private static logContextInfo(context: BuildContext, log: LogFunction): void {
    const totalDuration: [number, number] = process.hrtime(context.metrics.start);
    const name: string = builtPackage.name || 'with unknown name';
    const version: string = builtPackage.version || 'unknown';
    log(`Project ${name} version:`, info(version));

    const coreBuildVersion = coreBuildPackage && coreBuildPackage.version ? coreBuildPackage.version : 'unknown';
    log('Build tools version:', info(coreBuildVersion));

    log('Node version:', info(process.version));
    log('Total duration:', info(prettyTime(totalDuration)));
  }

  private static logTestResults(context: BuildContext, log: LogFunction): void {
    if (context.metrics.testsRun > 0) {
      log(
        'Tests results -',
        'Passed:',
        success(`${context.metrics.testsPassed}`),
        'Failed:',
        failure(`${context.metrics.testsFailed}`),
        'Skipped:',
        warn(`${context.metrics.testsSkipped}`),
      );
    }
  }

  private static logCoverageResults(context: BuildContext, log: LogFunction): void {
    if (context.metrics.coverageResults > 0) {
      log(
        'Coverage results -',
        'Passed:',
        success(`${context.metrics.coveragePass}`),
        'Failed:',
        failure(`${context.metrics.coverageResults - context.metrics.coveragePass}`),
        'Avg. Cov.:',
        info(`${Math.floor(context.metrics.coverageTotal / context.metrics.coverageResults)}%`),
      );
    }
  }

  private static logWarnings(context: BuildContext, log: LogFunction): void {
    if (context.warnings.length) {
      log('Task warnings:', warn(`${context.warnings.length.toString()}`));
    }
  }

  private static logErrors(context: BuildContext, log: LogFunction): void {
    let totalErrors = 0;
    if (context.metrics.taskErrors > 0 || context.errors.length) {
      totalErrors = context.metrics.taskErrors + context.errors.length;
      log('Task errors:', error(`${totalErrors}`));
    }
  }

  private static doWriteSumaryCallbacks(context: BuildContext): void {
    const callbacks: Array<() => void> = context.writeSummaryCallbacks;
    context.writeSummaryCallbacks = [];
    callbacks.forEach((writeSummaryCallback) => writeSummaryCallback());
  }
}
