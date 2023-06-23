import { BuildContext, Spawn, initialize } from '@codification/cutwater-build-core';
import { TestContext } from '@codification/cutwater-test';
import * as gulp from 'gulp';
import { basename, dirname } from 'path';
import { BuildImageTask } from './BuildImageTask';
import { PrepareImageContextTask } from './PrepareImageContextTask';

let ctx: TestContext;
let contextDirectory: string;
let buildCtx: BuildContext;
const name = 'build-image-test-image';

beforeAll(async () => {
  ctx = TestContext.createContext();
  initialize(gulp);
  const prepTask = new PrepareImageContextTask();
  contextDirectory = basename(dirname(ctx.createTempFilePath()));
  prepTask.setConfig({ imageConfigs: { name }, contextDirectory });
  buildCtx = BuildContext.create();
  await prepTask.execute(buildCtx);
}, 120000);

afterAll(async () => {
  ctx.teardown();
  await Spawn.create().execute({ command: 'docker', args: ['image', 'rm', name] });
});

describe('BuildImageTask', () => {
  describe('executeTask', () => {
    it('builds a docker image', async () => {
      const task: BuildImageTask = new BuildImageTask();
      task.setConfig({ imageConfigs: { name }, contextDirectory });
      await task.execute(buildCtx);
      const result = (await Spawn.create().execute({ command: 'docker', args: 'images' })).toString('utf-8');
      expect(result.indexOf(name)).toBeTruthy();
    }, 120000);
  });
});
