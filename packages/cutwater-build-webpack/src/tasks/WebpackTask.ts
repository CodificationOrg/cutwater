import { BuildConfig, GulpTask, Spawn, SpawnOptions, TextUtils } from '@codification/cutwater-build-core';
import { resolve } from 'path';

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
  spawnOpts: SpawnOptions;
  spawn: Spawn;
}

export class WebpackTask extends GulpTask<WebpackTaskConfig, void> {
  constructor() {
    super('webpack', {
      options: {
        config: [],
        stats: true,
      },
      spawn: Spawn.create(),
      spawnOpts: {
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

  public async executeTask(): Promise<void> {
    const defaultConfig = this.defaultConfig();
    const { initwebpack } = this.buildContext.buildState.args;
    const shouldInitWebpack: boolean = typeof initwebpack === 'boolean' && initwebpack;

    if (shouldInitWebpack) {
      this.log(
        'Initializing a webpack.config.js, which bundles lib/index.js into dist/packagename.js into a UMD module.',
      );
      const webpackFile = this.system.toFileReference(resolve(this.system.cwd(), 'webpack.config.js'));
      webpackFile.copyTo(this.system.toFileReference('.'));
      return;
    } else {
      if (!this.config.options?.config && !defaultConfig) {
        this.logMissingConfigWarning();
        return;
      }
      if (!this.config.options) {
        this.config.options = {};
      }
      if (!this.config.options.config) {
        this.config.options.config = [defaultConfig];
      }
      this.config.options.mode = this.buildConfig.production ? 'production' : 'development';
      const args = `${this.prepareOptions()}`;
      this.logVerbose(`Running: webpack ${args}`);
      await this.config.spawn.execute({
        logger: this.logger(),
        ...this.config.spawnOpts!,
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
    console.warn('No webpack config has been provided. ' + 'Run again using --initwebpack to create a default config.');
  }

  private defaultConfig(): string {
    const includedConfig = resolve(__dirname, 'webpack.config.js');
    const localConfig = resolve(this.system.cwd(), 'webpack.config.js');
    return this.system.fileExists(localConfig) ? localConfig : includedConfig;
  }
}
