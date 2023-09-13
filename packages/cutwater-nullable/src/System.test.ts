import { System } from './System';

describe('System', () => {
  describe('mkdir', () => {
    it('can recursively create directories', () => {
      const result = System.createNull().mkdir('temp/extra', true);
      expect(result.exists()).toBeTruthy();
    });
  });
  describe('fileExists', () => {
    it('returns true for existing files', () => {
      const result = System.createNull().fileExists('../../yarn.lock');
      expect(result).toBeTruthy();
    });
    it('returns true for existing files with an absolute path', () => {
      const result = System.createNull().fileExists('/project/yarn.lock');
      expect(result).toBeTruthy();
    });
    it('returns false for missing files with an absolute path', () => {
      expect(System.createNull().fileExists('/temp/extra.ts')).toBeFalsy();
    });
  });

  describe('toFileReference', () => {
    describe('copyTo', () => {
      it('can copy to another file', () => {
        const system = System.createNull();
        const result = system
          .toFileReference('/project/package.json')
          .copyTo(system.toFileReference('/root.json'));
        expect(result.exists()).toBeTruthy();
        expect(
          (result.readObjectSync<Record<string, string>>() || {})['name']
        ).toBe('rootPackageJson');
      });
    });
    describe('readObjectSyncSafe', () => {
      it('can read a yaml file', () => {
        const result = System.createNull()
          .toFileReference('/project/package.yaml')
          .readObjectSyncSafe<{ name: string }>();
        expect(result).toBeDefined();
        expect(result.name).toBe('rootPackageJson');
      });
      it('can read a json file', () => {
        const result = System.createNull()
          .toFileReference('/project/package.json')
          .readObjectSyncSafe<{ name: string }>();
        expect(result).toBeDefined();
        expect(result.name).toBe('rootPackageJson');
      });
    });
    describe('writeObjectSync', () => {
      it('can write a json file', () => {
        const ref = System.createNull()
          .toFileReference('/project/test.json')
          .writeObjectSync({ name: 'Phil', age: 42 });
        const result: Record<string, unknown> = ref.readObjectSyncSafe();
        expect(result).toBeDefined();
        expect(result['name']).toBe('Phil');
        expect(result['age']).toBe(42);
      });
    });
  });
});
