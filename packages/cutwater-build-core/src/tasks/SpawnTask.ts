import { Spawn, SpawnOptions } from '@codification/cutwater-nullable';
import { GulpTask } from './GulpTask';

export interface SpawnTaskConfig extends SpawnOptions {
  spawn: Spawn;
}

export class SpawnTask<T extends SpawnTaskConfig> extends GulpTask<T, void> {
  public constructor(taskName = 'run-command', defaultConfig: Partial<T> = {}) {
    super(taskName, {
      quiet: false,
      ignoreErrors: false,
      cwd: process.cwd(),
      env: {},
      spawn: Spawn.create(),
      ...defaultConfig,
    } as T);
  }

  public async executeTask(): Promise<void> {
    this.logVerbose(`Running: ${this.preparedCommand()} ${this.preparedArgs()}`);
    await this.config.spawn.execute({
      ...this.config,
      logger: this.logger(),
      command: this.preparedCommand(),
      args: this.preparedArgs(),
    });
  }

  protected preparedCommand(): string {
    return this.config.command;
  }

  protected preparedArgs(): string | string[] {
    return this.config.args || '';
  }
}
