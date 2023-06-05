import { IOUtils, PACKAGE_JSON, executeTaskTest } from '@codification/cutwater-build-core';
import { TestContext } from '@codification/cutwater-test';
import { existsSync } from 'fs';
import { basename, dirname, resolve } from 'path';
import { DOCKERFILE } from '../Constants';
import { PrepareImageContextTask } from './PrepareImageContextTask';

let ctx: TestContext;

beforeEach(() => {
  ctx = TestContext.createContext();
});

afterEach(() => {
  ctx.teardown();
});

describe('PrepareImageContextTask', () => {
  describe('executeTask', () => {
    it('prepares context to build a docker image', async () => {
      const task: PrepareImageContextTask = new PrepareImageContextTask();
      const contextFolder = basename(dirname(ctx.createTempFilePath()));
      task.setConfig({ contextFolder });
      await executeTaskTest(task);
      const contextPath = IOUtils.resolvePath(`${task.buildConfig.tempFolder}/${contextFolder}`, task.buildConfig);
      expect(existsSync(`${contextPath}/${PACKAGE_JSON}`)).toBeTruthy();
      expect(existsSync(`${contextPath}/packages/app`)).toBeTruthy();
      expect(existsSync(`${contextPath}/Dockerfile`)).toBeTruthy();
    });
    it('prepares context to build a docker image using an image config', async () => {
      const task: PrepareImageContextTask = new PrepareImageContextTask();
      const contextFolder = basename(dirname(ctx.createTempFilePath()));
      task.setConfig({ contextFolder, configs: { name: 'foo', dockerfile: resolve(__dirname, DOCKERFILE) } });
      await executeTaskTest(task);
      const contextPath = IOUtils.resolvePath(`${task.buildConfig.tempFolder}/${contextFolder}`, task.buildConfig);
      expect(existsSync(`${contextPath}/${PACKAGE_JSON}`)).toBeTruthy();
      expect(existsSync(`${contextPath}/packages/app`)).toBeTruthy();
      expect(existsSync(`${contextPath}/Dockerfile.foo`)).toBeTruthy();
    });
  });
});
