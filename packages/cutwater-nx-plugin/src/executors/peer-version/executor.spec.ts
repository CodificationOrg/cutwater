import { ExecutorContext } from '@nx/devkit';
import executor from './Executor';
import { PeerVersionOptions } from './Schema';

const options: PeerVersionOptions = {};
const context: ExecutorContext = {
  root: '/Projects/Test',
  isVerbose: true,
  cwd: '/Projects/Test',
};

describe('PeerVersion Executor', () => {
  it('can run', async () => {
    const output = await executor(options, context);
    expect(output.success).toBe(true);
  });
});
