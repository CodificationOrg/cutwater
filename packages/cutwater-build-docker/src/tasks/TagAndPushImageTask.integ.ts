import { RunCommand, getConfig, initialize } from '@codification/cutwater-build-core';
import { createContext } from '@codification/cutwater-build-core/lib/BuildContext';
import { getLogger } from '@codification/cutwater-build-core/lib/logging/Logger';
import { TestContext } from '@codification/cutwater-test';
import * as gulp from 'gulp';
import { basename, dirname } from 'path';
import { BuildImageTask } from './BuildImageTask';
import { PrepareImageContextTask } from './PrepareImageContextTask';
import { TagAndPushImageTask } from './TagAndPushImageTask';

let ctx: TestContext;
let contextFolder: string;
const name = 'tag-and-push-test-image';

beforeAll(async () => {
  ctx = TestContext.createContext();
  initialize(gulp);
  contextFolder = basename(dirname(ctx.createTempFilePath()));
  const prepTask = new PrepareImageContextTask();
  prepTask.setConfig({ contextFolder });
  await prepTask.execute(createContext(getConfig(), gulp, getLogger()));

  const buildTask = new BuildImageTask();
  buildTask.setConfig({ imageConfigs: { name }, contextFolder });
  await buildTask.execute(createContext(getConfig(), gulp, getLogger()));
}, 60000);

afterAll(async () => {
  ctx.teardown();
  await new RunCommand().run({ command: 'docker', args: ['image', 'rm', name] });
});

describe('TagAndPushImageTask', () => {
  describe('executeTask', () => {
    it('tags a docker a docker image', async () => {
      const task: TagAndPushImageTask = new TagAndPushImageTask();
      task.setConfig({ name });
      await task.execute(createContext(getConfig(), gulp, getLogger()));
      const result = (await new RunCommand().run({ command: 'docker', args: 'images' })).toString('utf-8');
      expect(result.indexOf(name)).toBeTruthy();
    }, 30000);
  });
});
