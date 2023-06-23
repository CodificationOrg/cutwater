import { GulpTask, Spawn, SpawnOptions } from '@codification/cutwater-build-core';
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
  cliBinaryFormat?: 'base64' | 'raw-in-base64-out';
  noCliPager?: boolean;
  cliAutoPrompt?: boolean;
  noCliAutoPrompt?: boolean;
}

export interface AwsCliTaskConfig<P> extends CliConfig<AwsCliOptions, P> {
  spawn: Spawn;
}

export class AwsCliTask<P = Record<string, never>> extends GulpTask<AwsCliTaskConfig<P>, void> {
  protected output: Buffer | undefined;
  protected readonly awsCommand: string;
  protected readonly awsSubCommand: string;
  protected readonly filteredParams: string[];

  public constructor(
    taskName = 'aws-cli',
    command = '',
    subCommand = '',
    filteredParams: string[] = [],
    defaultConfig: Partial<AwsCliTaskConfig<P>> = {},
  ) {
    super(taskName, {
      spawn: Spawn.create(),
      spawnOptions: {
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
    if (!!taskConfig.spawnOptions) {
      this.setSpawnOptions(taskConfig.spawnOptions);
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

  public setSpawnOptions(options: Partial<SpawnOptions>): void {
    this.config.spawnOptions = { ...this.config.spawnOptions, ...options };
  }

  public replaceSpawnOptions(options: SpawnOptions): void {
    this.config.spawnOptions = options;
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
    this.log(`Running: ${this.config.spawnOptions.command} ${args}`);
    this.output = await this.config.spawn.execute({
      logger: this.logger(),
      ...this.config.spawnOptions,
      args,
    });
  }
}
