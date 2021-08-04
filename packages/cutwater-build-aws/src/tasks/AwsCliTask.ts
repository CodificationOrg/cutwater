import { GulpTask, RunCommand, RunCommandConfig, TextUtils } from '@codification/cutwater-build-core';
import * as gulp from 'gulp';

export interface AwsCliOptions {
  debug?: boolean;
  endpointUrl?: string;
  noVerifySsl?: boolean;
  noPaginate?: boolean;
  output?: 'json' | 'text' | 'table';
  query?: string;
  profile?: string;
  region?: string;
  version?: boolean;
  color?: 'on' | 'off' | 'auto';
  noSignRequest?: boolean;
  caBundle?: string;
  cliReadTimeout?: number;
  cliConnectTimeout?: number;
}

export interface AwsCliTaskConfig<P> {
  options?: AwsCliOptions;
  parameters?: P;
  runConfig: RunCommandConfig;
}

export class AwsCliTask<P> extends GulpTask<AwsCliTaskConfig<P>, void> {
  protected readonly awsCommand: string;
  protected readonly awsSubCommand: string;
  protected readonly filteredParams: string[];
  protected readonly runCommand: RunCommand = new RunCommand();

  public constructor(
    taskName = 'aws-cli',
    command = '',
    subCommand = '',
    filteredParams: string[] = [],
    defaultConfig: Partial<AwsCliTaskConfig<P>> = {},
  ) {
    super(taskName, {
      runConfig: {
        command: 'aws',
        quiet: false,
        ignoreErrors: false,
        cwd: process.cwd(),
        env: {},
      },
      ...defaultConfig,
    } as AwsCliTaskConfig<P>);
    this.awsCommand = command;
    this.awsSubCommand = subCommand;
    this.filteredParams = filteredParams;
  }

  public setConfig(taskConfig: Partial<AwsCliTaskConfig<P>>): void {
    if (!this.config) {
      this.config = {} as AwsCliTaskConfig<P>;
    }
    if (!!taskConfig.runConfig) {
      this.setRunConfig(taskConfig.runConfig);
    }
    if (!!taskConfig.options) {
      this.setOptions(taskConfig.options);
    }
    if (!!taskConfig.parameters) {
      this.setParameters(taskConfig.parameters);
    }
  }

  public replaceConfig(taskConfig: AwsCliTaskConfig<P>): void {
    this.config = taskConfig;
  }

  public setRunConfig(config: Partial<RunCommandConfig>): void {
    this.config.runConfig = { ...this.config.runConfig, ...config };
  }

  public replaceRunConfig(config: RunCommandConfig): void {
    this.config.runConfig = config;
  }

  public setOptions(options: Partial<AwsCliOptions>): void {
    this.config.options = { ...this.config.options, ...options };
  }

  public replaceOptions(options: AwsCliOptions): void {
    this.config.options = options;
  }

  public setParameters(parameters: Partial<P>): void {
    this.config.parameters = { ...(this.config.parameters as P), ...parameters };
  }

  public replaceParameters(parameters: P): void {
    this.config.parameters = parameters;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async executeTask(localGulp: gulp.Gulp): Promise<void> {
    const args = this.preparedArgs();
    this.log(`Running: ${this.config.runConfig.command} ${args}`);
    await this.runCommand.run({
      logger: this.logger(),
      ...this.config.runConfig,
      args,
    });
  }

  protected preparedArgs(): string {
    return `${this.preparedOptions()}${this.preparedCommand()}${this.preparedParameters()}`;
  }

  protected preparedCommand(): string {
    return !!this.awsCommand ? `${this.awsCommand}${!!this.awsSubCommand ? ' ' + this.awsSubCommand : ''} ` : '';
  }

  protected preparedOptions(): string {
    return !!this.config.options ? this.toArgString(this.config.options) : '';
  }

  protected toArgString(args: any, filteredArgs: string[] = []): string {
    const argArray: string[] = Object.keys(args)
      .filter(property => !filteredArgs.includes(property))
      .map(property => {
        const value = args[property];
        const arg = TextUtils.convertPropertyNameToArg(property);
        if (typeof value === 'string') {
          return `${arg} "${value}"`;
        } else if (typeof value === 'boolean' && !!value) {
          return arg;
        } else if (typeof value === 'number') {
          return `${arg} ${value}`;
        } else if (Array.isArray(value)) {
          return `${arg} ${this.toParameterList(value)}`;
        } else if (typeof value === 'object') {
          return `${arg} '${JSON.stringify(value)}'`;
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
    return !!this.config.parameters ? this.toArgString(this.config.parameters, this.filteredParams) : '';
  }
}
