import { RunCommand, RunCommandConfig as RunCommandTaskConfig } from '../support';
import { GulpTask } from './GulpTask';

export { RunCommandTaskConfig };

export class RunCommandTask<T extends RunCommandTaskConfig> extends GulpTask<T, void> {
  private readonly runCommand: RunCommand = new RunCommand();

  public constructor(taskName = 'run-command', defaultConfig: Partial<T> = {}) {
    super(taskName, {
      quiet: false,
      ignoreErrors: false,
      cwd: process.cwd(),
      env: {},
      ...defaultConfig,
    } as T);
  }

  public async executeTask(): Promise<void> {
    this.logVerbose(`Running: ${this.preparedCommand()} ${this.preparedArgs()}`);
    await this.runCommand.run({
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
