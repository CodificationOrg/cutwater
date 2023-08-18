import { BuildContext, Spawn, initialize } from '@codification/cutwater-build-core';
import * as gulp from 'gulp';
import { BuildImageTask } from './BuildImageTask';
import { PrepareImageContextTask } from './PrepareImageContextTask';
import { TagAndPushImageTask } from './TagAndPushImageTask';

let buildCtx: BuildContext;
const name = 'tag-and-push-test-image';

beforeAll(async () => {
  initialize(gulp);
  const prepTask = new PrepareImageContextTask();
  prepTask.setConfig({ imageConfigs: { name } });
  await prepTask.execute(BuildContext.create());

  buildCtx = BuildContext.create();
  const buildTask = new BuildImageTask();
  buildTask.setConfig({ imageConfigs: { name } });
  await buildTask.execute(buildCtx);
}, 120000);

afterAll(async () => {
  buildCtx.buildState.system.toFileReference(buildCtx.buildConfig.distFolder).delete(true);
  await Spawn.create().execute({ command: 'docker', args: ['image', 'rm', name] });
});

describe('TagAndPushImageTask', () => {
  describe('executeTask', () => {
    it('tags a docker a docker image', async () => {
      const task: TagAndPushImageTask = new TagAndPushImageTask();
      task.setConfig({ name });
      await task.execute(BuildContext.create());
      const result = (await Spawn.create().execute({ command: 'docker', args: 'images' })).toString('utf-8');
      expect(result.indexOf(name)).toBeTruthy();
    }, 120000);
  });
});
