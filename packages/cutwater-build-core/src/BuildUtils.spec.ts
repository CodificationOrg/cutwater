import * as path from 'path';

import { BuildUtils } from './BuildUtils';

describe('BuildUtils Unit Tests', () => {
  const cwd: string = path.resolve(__dirname);
  const cwdElements: string[] = cwd.split(path.sep);

  test('toPath', () => {
    const expected: string[] = [...cwdElements];
    expected.push('foo');
    expected.push('bar');
    expect(BuildUtils.toPath(expected)).toBe(expected.join(path.sep));

    const shorter: string[] = expected.slice(0, expected.length - 2);
    expect(BuildUtils.toPath(expected, expected.length - 2)).toBe(
      shorter.join(path.sep)
    );
  });
});
