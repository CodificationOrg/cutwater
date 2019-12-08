import { initialize } from '@codification/cutwater-build-core';
import * as gulp from 'gulp';
import { AwsVerificationTask } from './AwsVerificationTask';

beforeAll(() => {
  initialize(gulp);
});

test('it properly verifies that aws-cli is installed', () => {
  const task: AwsVerificationTask = new AwsVerificationTask();
  return expect(task.executeTask(gulp)).resolves.toBeUndefined();
});
