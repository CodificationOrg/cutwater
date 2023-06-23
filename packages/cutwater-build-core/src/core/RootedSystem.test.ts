import { resolve } from 'path';

import { RootedSystem } from './RootedSystem';

const createSystem = () => RootedSystem.createNullRootedSystem('/project/packages/package1');

describe('RootedSystem', () => {
  describe('mkdirs', () => {
    it('can recursively create directories relative to the rootPath', () => {
      const system = createSystem();
      const result = system.mkdir('temp/extra', true);
      expect(result.path).toBe(resolve(system.rootPath, 'temp/extra'));
      expect(result.exists()).toBeTruthy();
    });
  });
  describe('fileExists', () => {
    it('returns true for existing files relative to the rootPath', () => {
      const system = createSystem();
      const result = system.toFileReference('package.json');
      expect(result.path).toBe(resolve(system.rootPath, 'package.json'));
      expect(result.exists()).toBeTruthy();
    });
    it('returns true for existing files with an absolute path', () => {
      const system = createSystem();
      const result = system.toFileReference('/project/package.json');
      expect(result.exists()).toBeTruthy();
    });
  });
});
