import { initialize } from '@codification/cutwater-build-core';
import * as gulp from 'gulp';
import { CloudFormationPackageTask } from './CloudFormationPackageTask';

beforeAll(() => {
  initialize(gulp);
});

test('it properly fails with invalid arguments', async () => {
  const task: CloudFormationPackageTask = new CloudFormationPackageTask();
  try {
    await task.executeTask(gulp);
    fail('it should have thrown an error');
  } catch (err) {
    expect(err).toBeDefined();
  }
}, 20000);
