import { BuildContext, PACKAGE_JSON } from '@codification/cutwater-build-core';
import { join, resolve } from 'path';
import { DOCKERFILE } from '../Constants';
import { PrepareImageContextTask } from './PrepareImageContextTask';

let context: BuildContext;

beforeEach(() => {
  context = BuildContext.createNull();
  const { system } = context.buildState;
  system.mkdir(system.dirname, true);
  system.toFileReference(resolve(system.dirname, DOCKERFILE)).write(`
  FROM node:18.16

  COPY package.json yarn.lock ./
  COPY packages/ ./packages/

  RUN yarn install
  `);
  system.toFileReference(resolve(system.dirname, 'root-package.json')).write(`
  {
    "name": "docker-image-root",
    "description": "Docker Image NodeJS Root",
    "private": true,
    "workspaces": {
      "packages": ["packages/*"]
    }
  }
  `);
});

describe('PrepareImageContextTask', () => {
  describe('executeTask', () => {
    it('prepares context to build a docker image', async () => {
      const task: PrepareImageContextTask = new PrepareImageContextTask();
      await task.execute(context);
      const contextFolder = context.buildState.system.toFileReference(
        join(`${task.buildConfig.tempFolder}`, `${task.config.contextFolder}`),
      );
      const contextFiles = contextFolder.children().map(ref => ref.path);
      const contextPath = contextFolder.path;
      expect(contextFiles.includes(resolve(contextPath, PACKAGE_JSON))).toBeTruthy();
      expect(contextFiles.includes(resolve(contextPath, DOCKERFILE))).toBeTruthy();
    });
    it('prepares context to build a docker image using an image config', async () => {
      const task: PrepareImageContextTask = new PrepareImageContextTask();
      task.setConfig({ configs: { name: 'foo' } });
      await task.execute(context);
      const contextFolder = context.buildState.system.toFileReference(
        join(`${task.buildConfig.tempFolder}`, `${task.config.contextFolder}`),
      );
      const contextFiles = contextFolder.children().map(ref => ref.path);
      const contextPath = contextFolder.path;
      expect(contextFiles.includes(resolve(contextPath, PACKAGE_JSON))).toBeTruthy();
      expect(contextFiles.includes(resolve(contextPath, `${DOCKERFILE}.foo`))).toBeTruthy();
    });
  });
});
