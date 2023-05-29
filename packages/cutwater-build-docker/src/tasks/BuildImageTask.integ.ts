import { RunCommand, getConfig, initialize } from '@codification/cutwater-build-core';
import { createContext } from '@codification/cutwater-build-core/lib/BuildContext';
import { getLogger } from '@codification/cutwater-build-core/lib/logging/Logger';
import { TestContext } from '@codification/cutwater-test';
import * as gulp from 'gulp';
import { basename, dirname, resolve } from 'path';
import { BuildImageTask } from './BuildImageTask';
import { PrepareImageAssetsTask } from './PrepareImageAssetsTask';

let ctx: TestContext;
let tempAssetDirectory: string;
const name = 'build-image-test-image';

beforeAll(async () => {
  ctx = TestContext.createContext();
  initialize(gulp);
  const prepTask = new PrepareImageAssetsTask();
  tempAssetDirectory = basename(dirname(ctx.createTempFilePath()));
  prepTask.setConfig({
    dockerFile: `${resolve(__dirname, 'Dockerfile')}`,
    tempAssetDirectory,
  });
  await prepTask.execute(createContext(getConfig(), gulp, getLogger()));
}, 60000);

afterAll(async () => {
  ctx.teardown();
  await new RunCommand().run({ command: 'docker', args: ['image', 'rm', name] });
});

describe('BuildImageTask', () => {
  describe('executeTask', () => {
    it('builds a docker image', async () => {
      const task: BuildImageTask = new BuildImageTask();
      task.setConfig({
        name,
        tempAssetDirectory,
      });
      await task.execute(createContext(getConfig(), gulp, getLogger()));
      const result = (await new RunCommand().run({ command: 'docker', args: 'images' })).toString('utf-8');
      expect(result.indexOf(name)).toBeTruthy();
    }, 60000);
  });
});
