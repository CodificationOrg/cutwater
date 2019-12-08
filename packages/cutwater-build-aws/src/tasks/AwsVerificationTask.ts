import { RunCommandTask } from '@codification/cutwater-build-core';

export class AwsVerificationTask extends RunCommandTask<any> {
  public constructor() {
    super('aws-verification');
  }

  protected preparedCommand(): string {
    return 'aws';
  }

  protected preparedArgs(): string {
    return '--version';
  }
}
