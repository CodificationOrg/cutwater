import { BuildContext } from '@codification/cutwater-build-core';
import { SamVerificationTask } from './SamVerificationTask';

describe('SamVerificationTask', () => {
  it('it properly verifies that sam-cli is installed', () => {
    const task: SamVerificationTask = new SamVerificationTask();
    return expect(task.execute(BuildContext.create())).resolves.toBeUndefined();
  }, 15000);
});
