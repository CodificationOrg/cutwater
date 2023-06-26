import { join, resolve } from 'path';

import { BuildContext, PACKAGE_JSON } from '@codification/cutwater-build-core';

import { DOCKERFILE } from '../Constants';
import { PrepareImageContextTask } from './PrepareImageContextTask';

let context: BuildContext;

beforeEach(() => {
  context = BuildContext.create();
});

describe('PrepareImageContextTask', () => {
  describe('executeTask', () => {
    it('prepares context to build a docker image using an image config', async () => {
      const task: PrepareImageContextTask = new PrepareImageContextTask();
      task.setConfig({ imageConfigs: { name: 'foo' } });
      await task.execute(context);
      const contextDirectory = context.buildState.system.toFileReference(
        join(`${task.buildConfig.tempFolder}`, `${task.config.contextDirectory}`),
      );
      const contextFiles = contextDirectory.children().map(ref => ref.path);
      const contextPath = contextDirectory.path;
      expect(contextFiles.includes(resolve(contextPath, PACKAGE_JSON))).toBeTruthy();
      expect(contextFiles.includes(resolve(contextPath, `${DOCKERFILE}.foo`))).toBeTruthy();
    });
  });
});
