import {
  BuildConfig,
  GulpTask,
  IOUtils,
  RunCommand,
  RunCommandConfig,
  TextUtils,
} from '@codification/cutwater-build-core';
import { Gulp } from 'gulp';
import * as path from 'path';

export interface WebpackOptions {
  entry: string[];
  config: string[];
  configName: string[];
  name: string;
  color: boolean;
  merge: boolean;
  env: string[];
  progress: boolean | string;
  help: boolean;
  outputPath: string;
  target: string[];
  watch: boolean;
  hot: boolean;
  devtool: string;
  prefetch: string;
  json: boolean | string;
  mode: string;
  version: boolean;
  stats: boolean | string;
  analyze: boolean;
}

export interface WebpackTaskConfig {
  options?: Partial<WebpackOptions>;
  runConfig?: RunCommandConfig;
}

export class WebpackTask<TExtendedConfig = {}> extends GulpTask<WebpackTaskConfig> {
  protected readonly runCommand: RunCommand = new RunCommand();

  constructor() {
    super('webpack', {
      options: {
        config: ['./webpack.config.js'],
        stats: true,
      },
      runConfig: {
        command: 'webpack',
        quiet: false,
        ignoreErrors: false,
        cwd: process.cwd(),
        env: {},
      },
    });
  }

  public isEnabled(buildConfig: BuildConfig): boolean {
    return super.isEnabled(buildConfig) && this.config.options?.config !== null;
  }

  public async executeTask(localGulp: Gulp): Promise<void> {
    const shouldInitWebpack: boolean = process.argv.indexOf('--initwebpack') > -1;

    if (shouldInitWebpack) {
      this.log(
        'Initializing a webpack.config.js, which bundles lib/index.js into dist/packagename.js into a UMD module.',
      );
      IOUtils.copyFile(path.resolve(__dirname, 'webpack.config.js'));
      return;
    } else {
      if (!this.config.options?.config) {
        this.logMissingConfigWarning();
        return;
      }

      this.config.options.mode = this.buildConfig.production ? 'production' : 'development';
      const args = `${this.prepareOptions()}`;
      this.logVerbose(`Running: webpack ${args}`);
      await this.runCommand.run({
        logger: this.logger(),
        ...this.config.runConfig!,
        args,
      });
    }
  }

  protected toArgString(args: Partial<WebpackOptions>): string {
    const argArray: string[] = Object.keys(args).map(property => {
      const value = args[property];
      const arg = TextUtils.convertPropertyNameToArg(property);
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

  protected prepareOptions(): string {
    return !!this.config.options ? this.toArgString(this.config.options) : '';
  }

  private logMissingConfigWarning(): void {
    // tslint:disable-next-line:no-console
    console.warn('No webpack config has been provided. ' + 'Run again using --initwebpack to create a default config.');
  }
}
