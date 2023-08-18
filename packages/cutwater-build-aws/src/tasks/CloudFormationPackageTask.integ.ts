import { BuildContext } from '@codification/cutwater-build-core';
import { CloudFormationPackageTask } from './CloudFormationPackageTask';

describe('CloudFormationPackageTask', () => {
  it('it properly fails with invalid arguments', async () => {
    const task: CloudFormationPackageTask = new CloudFormationPackageTask();
    try {
      await task.execute(BuildContext.create());
      fail('it should have thrown an error');
    } catch (err) {
      expect(err).toBeDefined();
    }
  }, 20000);
});
