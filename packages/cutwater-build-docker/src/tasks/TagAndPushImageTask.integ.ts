import { BuildContext, Spawn, initialize } from '@codification/cutwater-build-core';
import { TestContext } from '@codification/cutwater-test';
import * as gulp from 'gulp';
import { basename, dirname } from 'path/win32';
import { BuildImageTask } from './BuildImageTask';
import { PrepareImageContextTask } from './PrepareImageContextTask';
import { TagAndPushImageTask } from './TagAndPushImageTask';

let ctx: TestContext;
let contextDirectory: string;
const name = 'tag-and-push-test-image';

beforeAll(async () => {
  ctx = TestContext.createContext();
  initialize(gulp);
  contextDirectory = basename(dirname(ctx.createTempFilePath()));
  const prepTask = new PrepareImageContextTask();
  prepTask.setConfig({ imageConfigs: { name }, contextDirectory });
  await prepTask.execute(BuildContext.create());

  const buildTask = new BuildImageTask();
  buildTask.setConfig({ imageConfigs: { name }, contextDirectory });
  await buildTask.execute(BuildContext.create());
}, 120000);

afterAll(async () => {
  ctx.teardown();
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
