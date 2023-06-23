import { initialize } from '@codification/cutwater-build-core';
import * as gulp from 'gulp';
import { SamPublishTask } from './SamPublishTask';

beforeAll(() => {
  initialize(gulp);
});

describe('SamPublishTask', () => {
  it('it properly sets the version from package.json', () => {
    const task: SamPublishTask = new SamPublishTask();
    task.setSpawnOptions({ dryrun: true });
    return expect(task.executeTask()).resolves.toBeUndefined();
  }, 15000);
});
