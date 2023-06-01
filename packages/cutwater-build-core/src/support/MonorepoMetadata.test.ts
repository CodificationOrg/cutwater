import { join, resolve } from 'path';
import { MonorepoMetadata } from '..';

describe('MonorepoMetadata', () => {
  describe('isRepoRoot', () => {
    it('returns false if not a repo root directory', () => {
      expect(MonorepoMetadata.isRepoRoot(process.cwd())).toBeFalsy();
    });
    it('returns true at the repo root', () => {
      expect(MonorepoMetadata.isRepoRoot(resolve(process.cwd(), '../..')));
    });
  });

  describe('findRepoRootPath', () => {
    it('successfully returns proper repo root path', () => {
      const expected = resolve(join(process.cwd(), '../..'));
      expect(MonorepoMetadata.findRepoRootPath(process.cwd())).toBe(expected);
    });
    it('returns undefined for invalid repo', () => {
      expect(MonorepoMetadata.findRepoRootPath(resolve('/'))).toBeUndefined();
    });
  });

  describe('create', () => {
    it('can successfully create monorepo metadata', () => {
      const result = MonorepoMetadata.create();
      const expected = resolve(join(process.cwd(), '../..'));
      expect(result.rootPath).toBe(expected);
    });
    it('throws and error for an invalid repo', () => {
      expect(() => {
        MonorepoMetadata.create('/');
      }).toThrow(Error);
    });
  });

  describe('rootPackageJSON', () => {
    it('successfully returns the root package.json object', () => {
      const result = MonorepoMetadata.create();
      expect(result.rootPackageJSON.name).toBe('cutwater');
    });
  });

  describe('packageNames', () => {
    it('successfully returns repo package names', () => {
      const result = MonorepoMetadata.create().packageNames;
      expect(result).toContain('@codification/cutwater-build-core');
    });
  });

  describe('getPackagePath', () => {
    it('successfully returns path for a repo package', () => {
      const metadata = MonorepoMetadata.create();
      expect(metadata.getPackagePath('@codification/cutwater-build-core').endsWith('build-core')).toBeTruthy();
    });
  });

  describe('getPackageJSON', () => {
    it('successfully returns package.json for a repo package', () => {
      const result = MonorepoMetadata.create().getPackageJSON('@codification/cutwater-core');
      expect(result.name).toBe('@codification/cutwater-core');
    });
  });

  describe('findAllDependentPackageNames', () => {
    it('successfully returns a list repo packages that are dependencies', () => {
      const result = MonorepoMetadata.create().findAllDependentPackageNames('@codification/cutwater-graphql');
      expect(result).toHaveLength(3);
      expect(result).toContain('@codification/cutwater-core');
    });
  });
});
