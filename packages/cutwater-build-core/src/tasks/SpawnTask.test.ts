import { BuildContext } from '../core';
import { Spawn } from '../core/Spawn';
import { SpawnTask, SpawnTaskConfig } from './SpawnTask';

describe('SpawnTask', () => {
  const spawn = Spawn.createNull({ output: 'Hello World!' });
  const tracker = spawn.trackOutput();
  const task: SpawnTask<SpawnTaskConfig> = new SpawnTask(undefined, { command: 'echo', args: '"Hello World!"', spawn });

  describe('executeTask', () => {
    it('can run echo', async () => {
      await task.execute(BuildContext.createNull());
      expect(tracker.data).toHaveLength(1);
      expect(tracker.data[0]).toBe('Hello World!');
    });
  });
});
