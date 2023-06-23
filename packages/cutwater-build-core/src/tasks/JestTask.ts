import { join } from 'path/win32';

import { PACKAGE_JSON } from '../core/Constants';
import { Spawn, SpawnOptions } from '../core/Spawn';
import { System } from '../core/System';
import { BuildConfig } from '../types';
import { GulpTask } from './GulpTask';

export interface JestOptions {
  all: boolean;
  automock: boolean;
  bail: number | boolean;
  browser: boolean;
  cache: boolean;
  changedFilesWithAncestor: boolean;
  changedSince: string;
  ci: boolean;
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
  globalSetup: string | undefined;
  globalTeardown: string | undefined;
  haste: string;
  init: boolean;
  json: boolean;
  lastCommit: boolean;
  logHeapUsage: boolean;
  logLevel: string;
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
  preset: string | undefined;
  projects: string[];
  prettierPath: string | undefined;
  resetMocks: boolean;
  resetModules: boolean;
  resolver: string | undefined;
  restoreMocks: boolean;
  roots: string[];
  runInBand: boolean;
  setupFiles: string[];
  setupFilesAfterEnv: string[];
  showConfig: boolean;
  silent: boolean;
  snapshotSerializers: string[];
  testEnvironment: string | null | undefined;
  testFailureExitCode: string | null | undefined;
  testMatch: string[];
  testNamePattern: string;
  testPathIgnorePatterns: string[];
  testPathPattern: string[];
  testRegex: string | string[];
  testResultsProcessor: string | undefined;
  testRunner: string;
  testSequencer: string;
  testURL: string;
  timers: string;
  transform: string;
  transformIgnorePatterns: string[];
  unmockedModulePathPatterns: string[] | undefined;
  updateSnapshot: boolean;
  useStderr: boolean;
  verbose: boolean | undefined;
  version: boolean;
  watch: boolean;
  watchAll: boolean;
  watchman: boolean;
  watchPathIgnorePatterns: string[];
}

export interface JestTaskConfig {
  spawn: Spawn;
  isEnabled: boolean;
  options?: Partial<JestOptions>;
  runConfig: SpawnOptions;
}

export function isJestEnabled(rootFolder: string, system: System): boolean {
  const configFile = system.toFileReference(join(rootFolder, 'config', 'jest.json'));
  return configFile.exists() && configFile.readObjectSyncSafe<JestTaskConfig>().isEnabled;
}

export class JestTask extends GulpTask<JestTaskConfig, void> {
  public constructor() {
    super('jest', {
      options: {
        cache: true,
        preset: 'ts-jest',
        testEnvironment: 'node',
        collectCoverageFrom: '<rootDir>/src/**/*.(ts|js)?(x), !src/**/*.test.*',
        coverage: true,
        coverageReporters: ['json', 'html'],
        testMatch: ['<rootDir>/src/**/*.(test|spec).(ts|js)?(x)'],
        testPathIgnorePatterns: ['<rootDir>/(lib|lib-amd|lib-es6|coverage|build|docs|node_modules)/'],
        modulePathIgnorePatterns: [`<rootDir>/(src|lib)/.*/${PACKAGE_JSON}`],
      },
      spawn: Spawn.create(),
      runConfig: {
        command: 'jest',
        quiet: false,
        ignoreErrors: false,
        cwd: process.cwd(),
        env: {},
      },
    });
  }

  public isEnabled(buildConfig: BuildConfig): boolean {
    return super.isEnabled(buildConfig) && !!this.config.isEnabled;
  }

  public async executeTask(): Promise<void> {
    const options: any = this.config.options || {};
    options.ci = this.buildConfig.production;
    options.coverageDirectory = join(this.buildConfig.tempFolder, 'coverage');
    options.rootDir = this.buildConfig.rootPath;
    options.testEnvironment = require.resolve('jest-environment-jsdom');
    options.cacheDirectory = join(this.buildConfig.rootPath, this.buildConfig.tempFolder, 'jest-cache');

    const args = `${this.prepareOptions()}`;
    this.logVerbose(`Running: jest ${args}`);
    await this.config.spawn.execute({
      logger: this.logger(),
      ...this.config.runConfig,
      args,
    });
  }

  protected toArgString(args: Partial<JestOptions>): string {
    const argArray: string[] = Object.keys(args).map((property) => {
      const value = args[property];
      const arg = `--${property}`;
      if (typeof value === 'string') {
        return `${arg} "${value}"`;
      } else if (typeof value === 'boolean' && !!value) {
        return arg;
      } else if (typeof value === 'number') {
        return `${arg} ${value}`;
      } else if (Array.isArray(value)) {
        return `${arg} ${this.toOptionList(value)}`;
      }
      return '';
    });
    return `${argArray.join(' ')} `;
  }

  protected toOptionList(arg: any[]): string {
    return arg
      .map((value) => {
        if (typeof value === 'string') {
          return `"${value}"`;
        } else if (typeof value === 'number') {
          return value;
        }
        return '';
      })
      .join(' ');
  }

  protected prepareOptions(): string {
    return this.config.options ? this.toArgString(this.config.options) : '';
  }
}
