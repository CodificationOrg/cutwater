import { initialize } from '@codification/cutwater-build-core';
import * as gulp from 'gulp';
import { SamVerificationTask } from './SamVerificationTask';

beforeAll(() => {
  initialize(gulp);
});

describe('SamVerificationTask', () => {
  it('it properly verifies that aws-cli is installed', () => {
    const task: SamVerificationTask = new SamVerificationTask();
    return expect(task.executeTask()).resolves.toBeUndefined();
  }, 15000);
});
