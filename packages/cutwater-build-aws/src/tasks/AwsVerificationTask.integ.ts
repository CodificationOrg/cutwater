import { BuildContext } from '@codification/cutwater-build-core';
import { AwsVerificationTask } from './AwsVerificationTask';

describe('AwsVerificationTask', () => {
  it('it properly verifies that aws-cli is installed', () => {
    const task: AwsVerificationTask = new AwsVerificationTask();
    return expect(task.execute(BuildContext.create())).resolves.toBeUndefined();
  }, 15000);
});
