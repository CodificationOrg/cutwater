import { BuildContext } from '@codification/cutwater-build-core';
import { SamPublishTask } from './SamPublishTask';

describe('SamPublishTask', () => {
  it('it properly sets the version from package.json', () => {
    const task: SamPublishTask = new SamPublishTask();
    task.setSpawnOptions({ dryrun: true });
    return expect(task.execute(BuildContext.create())).resolves.toBeUndefined();
  }, 15000);
});
