import * as gulp from 'gulp';
import { RunCommand, RunCommandConfig } from '../utilities/RunCommand';
import { GulpTask } from './GulpTask';

// tslint:disable-next-line: no-empty-interface
export interface RunCommandTaskConfig extends RunCommandConfig {}

export class RunCommandTask<T extends RunCommandTaskConfig> extends GulpTask<T> {
  private readonly runCommand: RunCommand = new RunCommand();

  public constructor(taskName: string = 'run-command', defaultConfig: Partial<T> = {}) {
    super(taskName, {
      quiet: false,
      ignoreErrors: false,
      cwd: process.cwd(),
      env: {},
      ...defaultConfig,
    } as T);
  }

  public executeTask(localGulp: gulp.Gulp): Promise<void> {
    this.logVerbose(`Running: ${this.preparedCommand()} ${this.preparedArgs()}`);
    return this.runCommand.run({
      ...this.config,
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
