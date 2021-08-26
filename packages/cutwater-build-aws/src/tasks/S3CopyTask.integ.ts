import { initialize } from '@codification/cutwater-build-core';
import * as gulp from 'gulp';
import { S3CopyTask } from './S3CopyTask';

beforeAll(() => {
  initialize(gulp);
});

describe('S3CopyTask', () => {
  it('it properly fails with invalid arguments', async () => {
    const task: S3CopyTask = new S3CopyTask();
    task.setArguments(['boo', 'bar']);
    try {
      await task.executeTask();
      fail('it should have thrown an error');
    } catch (err) {
      expect(err).toBeDefined();
    }
  }, 20000);
});
