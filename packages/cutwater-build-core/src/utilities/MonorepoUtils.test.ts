import { join, resolve } from 'path';
import { MonorepoUtils } from '..';
import { PackageJSON } from '../State';

describe('MonorepoUtils', () => {
  describe('isRepoRoot', () => {
    it('returns false if not a repo root directory', () => {
      expect(MonorepoUtils.isRepoRoot(process.cwd())).toBeFalsy();
    });
    it('returns true at the repo root', () => {
      expect(MonorepoUtils.isRepoRoot(resolve(process.cwd(), '../..')));
    });
  });

  describe('findRepoRootPath', () => {
    it('successfully returns proper repo root path', () => {
      const expected = resolve(join(process.cwd(), '../..'));
      expect(MonorepoUtils.findRepoRootPath()).toBe(expected);
    });
    it('returns undefined for invalid repo', () => {
      expect(MonorepoUtils.findRepoRootPath(resolve('/'))).toBeUndefined();
    });
  });

  describe('loadRepoRootPackageJSON', () => {
    it('successfully returns the root package.json object', () => {
      const result = MonorepoUtils.loadRepoRootPackageJSON();
      expect(result).toBeDefined();
      expect(result?.name).toBe('cutwater');
    });
    it('returns undefined for invalid repo', () => {
      expect(MonorepoUtils.loadRepoRootPackageJSON(resolve('/'))).toBeUndefined();
    });
  });

  describe('findRepoWorkspacePaths', () => {
    it('successfully returns workspace paths', () => {
      const result = MonorepoUtils.findRepoWorkspacePaths(MonorepoUtils.loadRepoRootPackageJSON()!);
      expect(result.length).toBe(1);
      expect(result[0]).toBe('packages/*');
    });
    it('returns empty array for invalid object', () => {
      const result = MonorepoUtils.findRepoWorkspacePaths({} as PackageJSON);
      expect(result.length).toBe(0);
    });
  });

  describe('findRepoModules', () => {
    it('successfully returns repo module records', () => {
      const result = MonorepoUtils.findRepoModules();
      expect(result).toHaveProperty('@codification/cutwater-build-core');
    });
    it('returns empty record for invalid repo', () => {
      const result = MonorepoUtils.findRepoModules(resolve('/'));
      expect(Object.keys(result).length).toBe(0);
    });
  });
});
