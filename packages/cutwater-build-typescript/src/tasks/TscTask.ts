import { GulpTask, RunCommand, RunCommandConfig } from '@codification/cutwater-build-core';
import * as gulp from 'gulp';

export interface TscOptions {
  allowJs: boolean;
  allowSyntheticDefaultImports: boolean;
  allowUmdGlobalAccess: boolean;
  allowUnreachableCode: boolean;
  allowUnusedLabels: boolean;
  alwaysStrict: boolean;
  assumeChangesOnlyAffectDirectDependencies: boolean;
  baseUrl: string;
  build: boolean;
  charset: string;
  checkJs: boolean;
  composite: boolean;
  declaration: boolean;
  declarationDir: string;
  declarationMap: boolean;
  diagnostics: boolean;
  disableSizeLimit: boolean;
  downlevelIteration: boolean;
  emitBOM: boolean;
  emitDeclarationOnly: boolean;
  emitDecoratorMetadata: boolean;
  esModuleInterop: boolean;
  experimentalDecorators: boolean;
  extendedDiagnostics: boolean;
  forceConsistentCasingInFileNames: boolean;
  generateCpuProfile: string;
  help: boolean;
  importHelpers: boolean;
  incremental: boolean;
  inlineSourceMap: boolean;
  inlineSources: boolean;
  init: boolean;
  isolatedModules: boolean;
  jsx: string;
  jsxFactory: string;
  jsxFragmentFactory: string;
  keyofStringsOnly: boolean;
  lib: string[];
  listEmittedFiles: boolean;
  listFiles: boolean;
  locale: string;
  mapRoot: string;
  maxNodeModuleJsDepth: number;
  module: string;
  moduleResolution: string;
  newLine: string;
  noEmit: boolean;
  noEmitHelpers: boolean;
  noEmitOnError: boolean;
  noErrorTruncation: boolean;
  noFallthroughCasesInSwitch: boolean;
  noImplicitAny: boolean;
  noImplicitReturns: boolean;
  noImplicitThis: boolean;
  noImplicitUseStrict: boolean;
  noLib: boolean;
  noResolve: boolean;
  noStrictGenericChecks: boolean;
  noUnusedLocals: boolean;
  noUnusedParameters: boolean;
  outDir: string;
  outFile: string;
  paths: {};
  preserveConstEnums: boolean;
  preserveSymlinks: boolean;
  preserveWatchOutput: boolean;
  pretty: boolean;
  project: string;
  reactNamespace: string;
  removeComments: boolean;
  resolveJsonModule: boolean;
  rootDir: string;
  rootDirs: string[];
  showConfig: boolean;
  skipDefaultLibCheck: boolean;
  skipLibCheck: boolean;
  sourceMap: boolean;
  sourceRoot: string;
  strict: boolean;
  strictBindCallApply: boolean;
  strictFunctionTypes: boolean;
  strictPropertyInitialization: boolean;
  strictNullChecks: boolean;
  suppressExcessPropertyErrors: boolean;
  suppressImplicitAnyIndexErrors: boolean;
  target: string;
  traceResolution: boolean;
  tsBuildInfoFile: string;
  types: string[];
  typeRoots: string[];
  useDefineForClassFields: boolean;
  version: boolean;
  watch: boolean;
}

export interface TscTaskConfig {
  parameters?: Partial<TscOptions>;
  runConfig?: RunCommandConfig;
}

export class TscTask extends GulpTask<any> {
  protected readonly runCommand: RunCommand = new RunCommand();

  public constructor() {
    super('tsc', {
      parameters: {},
      runConfig: {
        command: 'tsc',
        quiet: false,
        ignoreErrors: false,
        cwd: process.cwd(),
        env: {},
      },
    });
  }

  public async executeTask(localGulp: gulp.Gulp, completeCallback: (error?: string | Error) => void): Promise<void> {
    const params: Partial<TscOptions> = this.config.parameters || {};
    params.outDir = params.outDir || this.config.libFolder;

    const args = `${this.preparedParameters()}`;
    this.logVerbose(`Running: tsc ${args}`);
    await this.runCommand.run({
      logger: this.logger(),
      ...this.config.runConfig!,
      args,
    });
  }

  protected toArgString(args: Partial<TscOptions>): string {
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
