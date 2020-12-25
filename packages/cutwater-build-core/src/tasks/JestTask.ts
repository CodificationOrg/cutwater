import * as gulp from 'gulp';
import * as path from 'path';
import { BuildConfig } from '../';
import { IOUtils } from '../utilities/IOUtils';
import { RunCommand, RunCommandConfig } from '../utilities/RunCommand';
import { GulpTask } from './GulpTask';

export interface JestParameters {
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
  globalSetup: string | null | undefined;
  globalTeardown: string | null | undefined;
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

export interface JestTaskConfig {
  isEnabled: boolean;
  testMatch?: string;
  parameters?: Partial<JestParameters>;
  runConfig?: RunCommandConfig;
}

export function isJestEnabled(rootFolder: string): boolean {
  const taskConfigFile: string = path.join(rootFolder, 'config', 'jest.json');
  return IOUtils.fileExists(taskConfigFile) && IOUtils.readJSONSyncSafe<JestTaskConfig>(taskConfigFile).isEnabled;
}

export class JestTask extends GulpTask<JestTaskConfig> {
  protected readonly runCommand: RunCommand = new RunCommand();

  public constructor() {
    super('jest', {
      parameters: {
        cache: true,
        collectCoverageFrom: '<rootDir>/lib/**/*.js?(x), !lib/**/*.test.*',
        coverage: true,
        coverageReporters: ['json', 'html'],
        testMatch: ['<rootDir>/lib/**/*.(test|spec).js?(x)'],
        testPathIgnorePatterns: ['<rootDir>/(src|lib-amd|lib-es6|coverage|build|docs|node_modules)/'],
        modulePathIgnorePatterns: ['<rootDir>/(src|lib)/.*/package.json'],
      },
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

  public async executeTask(localGulp: gulp.Gulp, completeCallback: (error?: string | Error) => void): Promise<void> {
    const params: any = this.config.parameters || {};
    params.ci = this.buildConfig.production;
    params.coverageDirectory = path.join(this.buildConfig.tempFolder, 'coverage');
    params.rootDir = this.buildConfig.rootPath;
    params.testEnvironment = require.resolve('jest-environment-jsdom');
    params.cacheDirectory = path.join(this.buildConfig.rootPath, this.buildConfig.tempFolder, 'jest-cache');

    const args = `${this.preparedParameters()}`;
    this.logVerbose(`Running: jest ${args}`);
    await this.runCommand.run({
      logger: this.logger(),
      ...this.config.runConfig!,
      args,
    });
  }

  protected toArgString(args: Partial<JestParameters>): string {
    const argArray: string[] = Object.keys(args).map(property => {
      const value = args[property];
      const arg = `--${property}`;
      if (typeof value === 'string') {
        return `${arg} "${value}"`;
      } else if (typeof value === 'boolean' && !!value) {
        return arg;
      } else if (typeof value === 'number') {
        return `${arg} ${value}`;
      } else if (Array.isArray(value)) {
        return `${arg} ${this.toParameterList(value)}`;
      }
      return '';
    });
    return `${argArray.join(' ')} `;
  }

  protected toParameterList(arg: any[]): string {
    return arg
      .map(value => {
        if (typeof value === 'string') {
          return `"${value}"`;
        } else if (typeof value === 'number') {
          return value;
        }
        return '';
      })
      .join(' ');
  }

  protected preparedParameters(): string {
    return !!this.config.parameters ? this.toArgString(this.config.parameters) : '';
  }
}
