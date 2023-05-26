import { RunCommand } from '@codification/cutwater-build-core';
import { AwsCliTask } from './AwsCliTask';

export interface EcrLoginParameters {
  accountId: string;
}

export class EcrLoginTask extends AwsCliTask<EcrLoginParameters> {
  public constructor() {
    super('ecr-login', 'ecr', 'get-login-password');
  }

  public async executeTask(): Promise<void> {
    if (!this.config.options?.region) {
      throw new Error('Region option must be provided.');
    }
    if (!this.config.parameters?.accountId) {
      throw new Error('accountId parameter must be provided.');
    }
    await super.executeTask();
    if (this.output) {
      const password = this.output.toString('utf-8');
      this.output = undefined;

      await new RunCommand().run({
        logger: this.logger(),
        ...this.config.runConfig,
        command: 'docker',
        args: `login --username AWS --password-stdin ${this.config.parameters?.accountId}.dkr.ecr.${this.config.options?.region}.amazonaws.com`,
        stdin: password,
      });
    }
  }
}
