import { RunCommandTask, RunCommandTaskConfig } from './RunCommandTask';

describe('RunCommandTask', () => {
  const task: RunCommandTask<RunCommandTaskConfig> = new RunCommandTask();

  describe('executeTask', () => {
    it('can run echo', async () => {
      task.setConfig({ command: 'echo', args: '"Hello World!"' });
      try {
        await task.executeTask();
      } catch (err) {
        fail(err);
      }
    });
  });
});
