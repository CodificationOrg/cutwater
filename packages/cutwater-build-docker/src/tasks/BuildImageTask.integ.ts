import { RunCommand, getConfig, initialize } from '@codification/cutwater-build-core';
import { BuildContext, createContext } from '@codification/cutwater-build-core/lib/types/BuildContext';
import { getLogger } from '@codification/cutwater-build-core/lib/logging/Logger';
import { TestContext } from '@codification/cutwater-test';
import * as gulp from 'gulp';
import { basename, dirname } from 'path';
import { BuildImageTask } from './BuildImageTask';
import { PrepareImageContextTask } from './PrepareImageContextTask';

let ctx: TestContext;
let contextFolder: string;
let buildCtx: BuildContext;
const name = 'build-image-test-image';

beforeAll(async () => {
  ctx = TestContext.createContext();
  initialize(gulp);
  const prepTask = new PrepareImageContextTask();
  contextFolder = basename(dirname(ctx.createTempFilePath()));
  prepTask.setConfig({ contextFolder });
  buildCtx = createContext(getConfig(), gulp, getLogger());
  await prepTask.execute(buildCtx);
}, 60000);

afterAll(async () => {
  ctx.teardown();
  await new RunCommand().run({ command: 'docker', args: ['image', 'rm', name] });
});

describe('BuildImageTask', () => {
  describe('executeTask', () => {
    it('builds a docker image', async () => {
      const task: BuildImageTask = new BuildImageTask();
      task.setConfig({ imageConfigs: { name }, contextFolder });
      await task.execute(buildCtx);
      const result = (await new RunCommand().run({ command: 'docker', args: 'images' })).toString('utf-8');
      expect(result.indexOf(name)).toBeTruthy();
    }, 60000);
  });
});
