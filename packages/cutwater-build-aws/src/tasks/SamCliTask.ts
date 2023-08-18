import { GulpTask, Spawn, SpawnOptions } from '@codification/cutwater-build-core';
import { CliUtils } from '../support/CliUtils';
import { CliConfig } from '../types/CliConfig';

export interface SamCliOptions {
  help?: true;
  debug?: boolean;
  profile?: string;
  region?: string;
}

export interface SamCliTaskConfig<P> extends CliConfig<SamCliOptions, P> {
  spawn: Spawn;
}

export class SamCliTask<P> extends GulpTask<SamCliTaskConfig<P>, void> {
  protected readonly samCommand: string;
  protected readonly filteredParams: string[] = [];

  public constructor(taskName = 'sam-cli', command = '', defaultConfig: Partial<SamCliTaskConfig<P>> = {}) {
    super(taskName, {
      spawn: Spawn.create(),
      spawnOptions: {
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

  public replaceConfig(taskConfig: SamCliTaskConfig<P>): void {
    this.config = taskConfig;
  }

  public setSpawnOptions(options: Partial<SpawnOptions>): void {
    this.config.spawnOptions = { ...this.config.spawnOptions, ...options };
  }

  public replaceSpawnOptions(options: SpawnOptions): void {
    this.config.spawnOptions = options;
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
      filteredParams: this.filteredParams,
    });
    this.log(`Running: ${this.config.spawnOptions.command} ${args}`);
    await this.config.spawn.execute({
      logger: this.logger(),
      ...this.config.spawnOptions,
      args,
    });
  }
}
