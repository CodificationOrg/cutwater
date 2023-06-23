import { BuildContext } from '@codification/cutwater-build-core';
import { S3CopyTask } from './S3CopyTask';

describe('S3CopyTask', () => {
  it('it properly fails with invalid arguments', async () => {
    const task: S3CopyTask = new S3CopyTask();
    task.setArguments(['boo', 'bar']);
    try {
      await task.execute(BuildContext.create());
      fail('it should have thrown an error');
    } catch (err) {
      expect(err).toBeDefined();
    }
  }, 20000);
});
