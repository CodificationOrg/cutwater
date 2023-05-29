import { IOUtils, getConfig, initialize } from '@codification/cutwater-build-core';
import { createContext } from '@codification/cutwater-build-core/lib/BuildContext';
import { getLogger } from '@codification/cutwater-build-core/lib/logging/Logger';
import { TestContext } from '@codification/cutwater-test';
import * as gulp from 'gulp';
import { basename, dirname } from 'path';
import { PrepareAWSLambdaImageAssetsTask } from './PrepareAWSLambdaImageAssetsTask';

let ctx: TestContext;

beforeAll(() => {
  ctx = TestContext.createContext();
  initialize(gulp);
});

afterAll(() => {
  ctx.teardown();
});

describe('PrepareAWSLambdaImageAssetsTask', () => {
  describe('executeTask', () => {
    it('prepares assets to build a docker image for AWS Lambda', async () => {
      const task: PrepareAWSLambdaImageAssetsTask = new PrepareAWSLambdaImageAssetsTask();
      task.setConfig({ tempAssetDirectory: basename(dirname(ctx.createTempFilePath())) });
      await task.execute(createContext(getConfig(), gulp, getLogger()));
      expect(IOUtils.fileExists(task.dockerFile, task.buildConfig)).toBeTruthy();
      const result = IOUtils.readToString(task.dockerFile, task.buildConfig);
      expect(result).toMatch(/18/);
      expect(result).toMatch(/lambda\.handler/);
    });
  });
});
