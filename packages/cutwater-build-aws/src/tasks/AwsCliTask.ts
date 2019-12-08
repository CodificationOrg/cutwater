import { RunCommandTask, RunCommandTaskConfig } from '@codification/cutwater-build-core';

export interface AwsCliTaskConfig extends RunCommandTaskConfig {
  awsCommand: string;
  subCommand: string;
}

export class AwsCliTask<T extends AwsCliTaskConfig> extends RunCommandTask<T> {
  public constructor(taskName: string = 'aws-cli', defaultConfig: Partial<T> = {}) {
    super(taskName, {
      command: 'aws',
      quiet: false,
      ignoreErrors: false,
      cwd: process.cwd(),
      env: {},
      ...defaultConfig,
    } as T);
  }

  protected preparedArgs(): string {
    return `${this.config.awsCommand} ${this.config.subCommand} ${this.preparedParameters()}`;
  }

  protected preparedParameters(): string {
    return '';
  }
}
