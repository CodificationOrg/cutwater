import { BuildContext, Spawn, initialize } from '@codification/cutwater-build-core';
import * as gulp from 'gulp';
import { BuildImageTask } from './BuildImageTask';
import { PrepareImageContextTask } from './PrepareImageContextTask';

let buildCtx: BuildContext;
const name = 'build-image-test-image';

beforeAll(async () => {
  initialize(gulp);
  const prepTask = new PrepareImageContextTask();
  prepTask.setConfig({ imageConfigs: { name } });
  buildCtx = BuildContext.create();
  await prepTask.execute(buildCtx);
}, 120000);

afterAll(async () => {
  buildCtx.buildState.system.toFileReference(buildCtx.buildConfig.distFolder).delete(true);
  await Spawn.create().execute({ command: 'docker', args: ['image', 'rm', name] });
});

describe('BuildImageTask', () => {
  describe('executeTask', () => {
    it('builds a docker image', async () => {
      const task: BuildImageTask = new BuildImageTask();
      task.setConfig({ imageConfigs: { name } });
      await task.execute(buildCtx);
      const result = (await Spawn.create().execute({ command: 'docker', args: 'images' })).toString('utf-8');
      expect(result.indexOf(name)).toBeTruthy();
    }, 120000);
  });
});
