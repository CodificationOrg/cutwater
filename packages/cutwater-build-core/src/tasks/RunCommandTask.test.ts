import * as gulp from 'gulp';
import { initialize } from '..';
import { RunCommandTask, RunCommandTaskConfig } from './RunCommandTask';

initialize(gulp);

describe('RunCommandTask', () => {
  const task: RunCommandTask<RunCommandTaskConfig> = new RunCommandTask();

  it('can run echo', async () => {
    task.setConfig({ command: 'echo', args: '"Hello World!"' });
    try {
      await task.executeTask();
    } catch (err) {
      fail(err);
    }
  });
});
