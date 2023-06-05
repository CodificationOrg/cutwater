import { Gulp } from 'gulp';
import { BuildConfig } from './BuildConfig';
import { Logger } from '../logging/Logger';
import { BuildMetrics } from './BuildMetrics';
import { BuildContextState } from './BuildContextState';

export interface BuildContext {
  gulp: Gulp;
  logger: Logger;
  warnings: string[];
  errors: string[];
  metrics: BuildMetrics;
  state: BuildContextState;
  writeSummaryCallbacks: Array<() => void>;
  exitCode: number;
  writeSummaryLogs: string[];
  buildConfig: BuildConfig;
  gulpErrorCallback: undefined | ((err: Error) => void);
  gulpStopCallback: undefined | ((err: Error) => void);
  errorAndWarningSuppressions: Array<string | RegExp>;
  shouldLogWarningsDuringSummary: boolean;
  shouldLogErrorsDuringSummary: boolean;
}
