import { default as prettyTime } from 'pretty-hrtime';

import { BuildContext } from '../BuildContext';
import { builtPackage, coreBuildPackage, getFlagValue } from '../State';
import { IOUtils } from '../utilities/IOUtils';

type LogFunction = (...args: string[]) => void;

export class BuildSummary {
  public static write(context: BuildContext, callback: () => void): void {
    const log: LogFunction = context.logger.log;
    context.writeSummaryCallbacks.push(callback);

    if (!context.state.writingSummary) {
      context.state.writingSummary = true;

      IOUtils.afterStreamsFlushed(context.state.duringFastExit, () => {
        log('==================[ Finished ]=================='.magenta);

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
          callbacks.forEach(writeSummaryCallback => writeSummaryCallback());
        });
      });
    } else if (context.state.wroteSummary) {
      this.doWriteSumaryCallbacks(context);
    }
  }

  private static relogIssues(context: BuildContext): void {
    const shouldRelogIssues: boolean = getFlagValue('relogIssues');
    if (shouldRelogIssues) {
      context.warnings.forEach(warning => {
        // tslint:disable-next-line: no-console
        console.error(warning.yellow);
      });
    }

    if (shouldRelogIssues && (context.metrics.taskErrors > 0 || context.errors.length)) {
      context.errors.forEach(err => {
        // tslint:disable-next-line: no-console
        console.error(err.red);
      });
    }
  }

  private static logSummaries(context: BuildContext, log: LogFunction): void {
    context.writeSummaryLogs.forEach(summary => log(summary));
  }

  private static logContextInfo(context: BuildContext, log: LogFunction): void {
    const totalDuration: [number, number] = process.hrtime(context.metrics.start);
    const name: string = builtPackage.name || 'with unknown name';
    const version: string = builtPackage.version || 'unknown';
    log(`Project ${name} version:`, version.yellow);

    const coreBuildVersion = coreBuildPackage && coreBuildPackage.version ? coreBuildPackage.version : 'unknown';
    log('Build tools version:', coreBuildVersion.yellow);

    log('Node version:', process.version.yellow);
    log('Total duration:', prettyTime(totalDuration).yellow);
  }

  private static logTestResults(context: BuildContext, log: LogFunction): void {
    if (context.metrics.testsRun > 0) {
      log(
        'Tests results -',
        'Passed:',
        `${context.metrics.testsPassed}`.green,
        'Failed:',
        `${context.metrics.testsFailed}`.red,
        'Skipped:',
        `${context.metrics.testsSkipped}`.yellow,
      );
    }
  }

  private static logCoverageResults(context: BuildContext, log: LogFunction): void {
    if (context.metrics.coverageResults > 0) {
      log(
        'Coverage results -',
        'Passed:',
        `${context.metrics.coveragePass}`.green,
        'Failed:',
        `${context.metrics.coverageResults - context.metrics.coveragePass}`.red,
        'Avg. Cov.:',
        `${Math.floor(context.metrics.coverageTotal / context.metrics.coverageResults)}%`.yellow,
      );
    }
  }

  private static logWarnings(context: BuildContext, log: LogFunction): void {
    if (context.warnings.length) {
      log('Task warnings:', `${context.warnings.length.toString()}`.yellow);
    }
  }

  private static logErrors(context: BuildContext, log: LogFunction): void {
    let totalErrors: number = 0;
    if (context.metrics.taskErrors > 0 || context.errors.length) {
      totalErrors = context.metrics.taskErrors + context.errors.length;
      log('Task errors:', `${totalErrors}`.red);
    }
  }

  private static doWriteSumaryCallbacks(context: BuildContext): void {
    const callbacks: Array<() => void> = context.writeSummaryCallbacks;
    context.writeSummaryCallbacks = [];
    callbacks.forEach(writeSummaryCallback => writeSummaryCallback());
  }
}
