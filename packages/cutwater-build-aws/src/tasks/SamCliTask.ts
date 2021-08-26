import { GulpTask, RunCommand, RunCommandConfig } from '@codification/cutwater-build-core';
import { CliUtils } from '../support/CliUtils';
import { CliConfig } from '../types/CliConfig';

export interface SamCliOptions {
  help?: true;
  debug?: boolean;
  profile?: string;
  region?: string;
}

export type SamCliTaskConfig<P> = CliConfig<SamCliOptions, P>;

export class SamCliTask<P> extends GulpTask<SamCliTaskConfig<P>, void> {
  protected readonly samCommand: string;
  protected readonly filteredParams: string[];
  protected readonly runCommand: RunCommand = new RunCommand();

  public constructor(taskName = 'sam-cli', command = '', defaultConfig: Partial<SamCliTaskConfig<P>> = {}) {
    super(taskName, {
      runConfig: {
        command: 'sam',
        quiet: false,
        ignoreErrors: false,
        cwd: process.cwd(),
        env: {},
      },
      ...defaultConfig,
    } as SamCliTaskConfig<P>);
    this.samCommand = command;
  }

  public setConfig(taskConfig: Partial<SamCliTaskConfig<P>>): void {
    if (!this.config) {
      this.config = {} as SamCliTaskConfig<P>;
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

  public replaceConfig(taskConfig: SamCliTaskConfig<P>): void {
    this.config = taskConfig;
  }

  public setRunConfig(config: Partial<RunCommandConfig>): void {
    this.config.runConfig = { ...this.config.runConfig, ...config };
  }

  public replaceRunConfig(config: RunCommandConfig): void {
    this.config.runConfig = config;
  }

  public setOptions(options: Partial<SamCliOptions>): void {
    this.config.options = { ...this.config.options, ...options };
  }

  public replaceOptions(options: SamCliOptions): void {
    this.config.options = options;
  }

  public setParameters(parameters: Partial<P>): void {
    this.config.parameters = { ...(this.config.parameters as P), ...parameters };
  }

  public replaceParameters(parameters: P): void {
    this.config.parameters = parameters;
  }

  public async executeTask(): Promise<void> {
    const args = CliUtils.prepareArgs(this.config, {
      command: this.samCommand,
    });
    this.log(`Running: ${this.config.runConfig.command} ${args}`);
    await this.runCommand.run({
      logger: this.logger(),
      ...this.config.runConfig,
      args,
    });
  }
}
