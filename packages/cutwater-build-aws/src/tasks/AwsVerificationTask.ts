import { AwsCliTask } from './AwsCliTask';

export class AwsVerificationTask extends AwsCliTask<void> {
  public constructor() {
    super('aws-verification');
    this.setOptions({ version: true });
  }
}
