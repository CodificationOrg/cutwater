import { resolve } from 'path';

import { BuildContext, PACKAGE_JSON } from '@codification/cutwater-build-core';

import { DOCKERFILE } from '../Constants';
import { PrepareImageContextTask } from './PrepareImageContextTask';

let context: BuildContext;

beforeEach(() => {
  context = BuildContext.createNull();
});

describe('PrepareImageContextTask', () => {
  describe('executeTask', () => {
    it('prepares context to build a docker image using an image config', async () => {
      const { system } = context.buildState;
      const task: PrepareImageContextTask = new PrepareImageContextTask();
      task.setConfig({ imageConfigs: { name: 'foo' } });
      await task.execute(context);
      const contextDirectory = context.buildState.system.toFileReference(task.buildConfig.distFolder);
      const contextFiles = contextDirectory.children().map(ref => ref.path);
      const contextPath = contextDirectory.path;
      expect(contextFiles.includes(resolve(contextPath, PACKAGE_JSON))).toBeTruthy();
      expect(contextFiles.includes(resolve(contextPath, `${DOCKERFILE}.foo`))).toBeTruthy();
      expect(system.toFileReference(resolve(contextPath, 'packages', 'app', 'lib', 'index.js')).exists()).toBeTruthy();
    });
  });
});
