import { Spawn, SpawnOptions, SpawnResponse } from './Spawn';

describe('Spawn', () => {
  describe('run', () => {
    it('print command only on dryrun', async () => {
      const result = await execute({ command: 'echo', args: '"Hello World!"', dryrun: true });
      expect(result).toBe('echo "Hello World!"');
    });
    it('returns the correct result', async () => {
      const result = await execute({ command: '' }, { output: 'Hello World!' });
      expect(result).toBe('Hello World!');
    });
  });
});

const execute = async (config: SpawnOptions, response?: SpawnResponse): Promise<string> => {
  return (await Spawn.createNull(response).execute(config)).toString();
};
