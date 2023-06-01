import { RunCommand } from './RunCommand';

describe('RunCommand', () => {
  const cmd: RunCommand = new RunCommand();

  it('can run echo', async () => {
    try {
      await cmd.run({ command: 'echo', args: '"Hello World!"' });
    } catch (err) {
      fail(err);
    }
  });
});
