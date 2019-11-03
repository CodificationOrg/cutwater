import * as gulp from 'gulp';
import { default as jest } from 'jest-cli';
import * as path from 'path';

import { AggregatedResult } from '@jest/test-result';
import { GlobalConfig } from '@jest/types/build/Config';

import { BuildConfig } from '../';
import { IOUtils } from '../utilities/IOUtils';
import { GulpTask } from './GulpTask';

export interface JestTaskConfig {
  isEnabled: boolean;
  all: boolean;
  automock: boolean;
  bail: number | boolean;
  browser: boolean;
  cache: boolean;
  changedFilesWithAncestor: boolean;
  changedSince: string;
  clearCache: boolean;
  clearMocks: boolean;
  collectCoverage: boolean;
  collectCoverageFrom: string;
  collectCoverageOnlyFrom: string[];
  color: boolean;
  colors: boolean;
  config: string;
  coverage: boolean;
  coveragePathIgnorePatterns: string[];
  coverageReporters: string[];
  coverageThreshold: string;
  debug: boolean;
  env: string;
  expand: boolean;
  findRelatedTests: boolean;
  forceExit: boolean;
  globals: string;
  globalSetup: string | null | undefined;
  globalTeardown: string | null | undefined;
  haste: string;
  init: boolean;
  json: boolean;
  lastCommit: boolean;
  logHeapUsage: boolean;
  maxWorkers: number;
  moduleDirectories: string[];
  moduleFileExtensions: string[];
  moduleNameMapper: string;
  modulePathIgnorePatterns: string[];
  modulePaths: string[];
  noStackTrace: boolean;
  notify: boolean;
  notifyMode: string;
  onlyChanged: boolean;
  outputFile: string;
  preset: string | null | undefined;
  projects: string[];
  prettierPath: string | null | undefined;
  resetMocks: boolean;
  resetModules: boolean;
  resolver: string | null | undefined;
  restoreMocks: boolean;
  roots: string[];
  runInBand: boolean;
  setupFiles: string[];
  setupFilesAfterEnv: string[];
  showConfig: boolean;
  silent: boolean;
  snapshotSerializers: string[];
  testFailureExitCode: string | null | undefined;
  testMatch: string[];
  testNamePattern: string;
  testPathIgnorePatterns: string[];
  testPathPattern: string[];
  testRegex: string | string[];
  testResultsProcessor: string | null | undefined;
  testRunner: string;
  testSequencer: string;
  testURL: string;
  timers: string;
  transform: string;
  transformIgnorePatterns: string[];
  unmockedModulePathPatterns: string[] | null | undefined;
  updateSnapshot: boolean;
  useStderr: boolean;
  verbose: boolean | null | undefined;
  version: boolean;
  watch: boolean;
  watchAll: boolean;
  watchman: boolean;
  watchPathIgnorePatterns: string[];
}

export function isJestEnabled(rootFolder: string): boolean {
  const taskConfigFile: string = path.join(rootFolder, 'config', 'jest.json');
  return IOUtils.fileExists(taskConfigFile) && IOUtils.readJSONSyncSafe<JestTaskConfig>(taskConfigFile).isEnabled;
}

export class JestTask extends GulpTask<JestTaskConfig> {
  public constructor() {
    super('jest', {
      cache: true,
      collectCoverageFrom: 'lib/**/*.js?(x), !lib/**/*.test.*',
      coverage: true,
      coverageReporters: ['json', 'html'],
      testMatch: ['lib/**/*.test.js?(x)'],
      testPathIgnorePatterns: ['<rootDir>/(src|lib-amd|lib-es6|coverage|build|docs|node_modules)/'],
      modulePathIgnorePatterns: ['<rootDir>/(src|lib)/.*/package.json'],
    });
  }

  public isEnabled(buildConfig: BuildConfig): boolean {
    return super.isEnabled(buildConfig) && !!this.config.isEnabled;
  }

  public executeTask(localGulp: gulp.Gulp, completeCallback: (error?: string | Error) => void): void {
    const { isEnabled, ...jestConfig } = this.config as any;

    jestConfig.ci = this.buildConfig.production;
    jestConfig.coverageDirectory = path.join(this.buildConfig.tempFolder, 'coverage');
    jestConfig.rootDir = this.buildConfig.rootPath;
    jestConfig.testEnvironment = require.resolve('jest-environment-jsdom');
    jestConfig.cacheDirectory = path.join(this.buildConfig.rootPath, this.buildConfig.tempFolder, 'jest-cache');

    jest.runCLI(jestConfig as any, [this.buildConfig.rootPath]).then(
      (result: { results: AggregatedResult; globalConfig: GlobalConfig }) => {
        if (result.results.numFailedTests || result.results.numFailedTestSuites) {
          completeCallback(new Error('Jest tests failed'));
        } else {
          if (!this.buildConfig.production) {
            // this._copySnapshots(this.buildConfig.libFolder, this.buildConfig.srcFolder);
          }
          completeCallback();
        }
      },
      err => {
        completeCallback(err);
      },
    );
  }
}
