import { initialize } from '@codification/cutwater-build-core';
import * as gulp from 'gulp';
import { AwsVerificationTask } from './AwsVerificationTask';

beforeAll(() => {
  initialize(gulp);
});

describe('AwsVerificationTask', () => {
  it('it properly verifies that aws-cli is installed', () => {
    const task: AwsVerificationTask = new AwsVerificationTask();
    return expect(task.executeTask(gulp)).resolves.toBeUndefined();
  });
});
