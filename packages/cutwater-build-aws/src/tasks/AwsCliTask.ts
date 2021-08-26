import { GulpTask, RunCommand, RunCommandConfig } from '@codification/cutwater-build-core';
import { CliUtils } from '../support/CliUtils';
import { CliConfig } from '../types/CliConfig';

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

export type AwsCliTaskConfig<P> = CliConfig<AwsCliOptions, P>;

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

  public setArguments(args: string[]): void {
    this.config.args = args;
  }

  public async executeTask(): Promise<void> {
    const args = CliUtils.prepareArgs(this.config, {
      command: this.awsCommand,
      subCommand: this.awsSubCommand,
      filteredParams: this.filteredParams,
    });
    this.log(`Running: ${this.config.runConfig.command} ${args}`);
    await this.runCommand.run({
      logger: this.logger(),
      ...this.config.runConfig,
      args,
    });
  }
}
