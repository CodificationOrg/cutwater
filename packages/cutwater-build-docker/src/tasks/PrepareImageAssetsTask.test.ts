import { IOUtils, getConfig, initialize } from '@codification/cutwater-build-core';
import { createContext } from '@codification/cutwater-build-core/lib/BuildContext';
import { getLogger } from '@codification/cutwater-build-core/lib/logging/Logger';
import { TestContext } from '@codification/cutwater-test';
import * as gulp from 'gulp';
import { basename, dirname, resolve } from 'path';
import { PrepareImageAssetsTask } from './PrepareImageAssetsTask';

let ctx: TestContext;

beforeAll(() => {
  ctx = TestContext.createContext();
  initialize(gulp);
});

afterAll(() => {
  ctx.teardown();
});

describe('PrepareImageAssetsTask', () => {
  describe('executeTask', () => {
    it('prepares assets to build a docker image', async () => {
      const task: PrepareImageAssetsTask = new PrepareImageAssetsTask();
      task.setConfig({
        dockerFile: `${resolve(__dirname, 'Dockerfile')}`,
        tempAssetDirectory: basename(dirname(ctx.createTempFilePath())),
      });
      await task.execute(createContext(getConfig(), gulp, getLogger()));
      expect(IOUtils.fileExists(task.dockerFile, task.buildConfig)).toBeTruthy();
    });
  });
});
