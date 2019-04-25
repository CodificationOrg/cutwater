import { BaseExecTask } from './BaseExecTask';
import { BuildUtils } from './BuildUtils';

/**
 * @beta
 */
// tslint:disable-next-line: interface-name
export interface JestConfig {
  file?: string;
  bail?: number;
  cache?: boolean;
  changedFilesWithAncestor?: boolean;
  changedSince?: boolean;
  ci?: boolean;
  clearCache?: boolean;
  collectCoverageFrom?: string;
  colors?: boolean;
  config?: string;
  coverage?: boolean;
  debug?: boolean;
  detectOpenHandles?: boolean;
  env?: string;
  errorOnDeprecated?: boolean;
  expand?: boolean;
  findRelatedTests?: string;
  forceExit?: boolean;
  help?: boolean;
  init?: boolean;
  json?: boolean;
  outputFile?: string;
  lastCommit?: boolean;
  listTests?: boolean;
  logHeapUsage?: boolean;
  maxConcurrency?: number;
  maxWorkers?: number | string;
  noStackTrace?: boolean;
  notify?: boolean;
  onlyChanged?: boolean;
  passWithNoTests?: boolean;
  projects?: string;
  reporters?: string[];
  runInBand?: boolean;
  runTestsByPath?: boolean;
  setupTestFrameworkScriptFile?: string;
  showConfig?: boolean;
  silent?: boolean;
  testNamePattern?: string;
  testLocationInResults?: boolean;
  testPathPattern?: string;
  testRunner?: string;
  updateSnapshot?: boolean;
  useStderr?: boolean;
  verbose?: boolean;
}

/**
 * @beta
 */
export class JestTask extends BaseExecTask<JestConfig> {
  public constructor(packageName?: string) {
    super('jest', 'cutwater-jest', {}, true, 'file');
    if (packageName) {
      this.setConfig({
        coverage: true,
        colors: true,
        reporters: ['jest-junit']
      });
      this.junitOutputFile = `../../reports/junit/${BuildUtils.toSimplePackageName(
        packageName
      )}-test-results.xml`;
    }
  }

  public set junitOutputFile(output: string) {
    process.env.JEST_JUNIT_OUTPUT = output;
  }
}
