import { resolve } from 'path';

import { MonorepoMetadata } from './MonorepoMetadata';

const metadata: MonorepoMetadata = MonorepoMetadata.createNull()!;

describe('MonorepoMetadata', () => {
  describe('isRepoRoot', () => {
    it('returns false if not a repo root directory', () => {
      expect(metadata.isRepoRoot(resolve('/'))).toBeFalsy();
    });
    it('returns true at the repo root', () => {
      expect(metadata.isRepoRoot(resolve('/project')));
    });
  });

  describe('findRepoRootPath', () => {
    it('successfully returns proper repo root path', () => {
      expect(metadata.findRepoRootPath(resolve('/project/packages/package1'))).toBe(resolve('/project'));
    });
    it('returns undefined for invalid repo', () => {
      expect(metadata.findRepoRootPath(resolve('/'))).toBeUndefined();
    });
  });

  describe('create', () => {
    it('returns undefined for an invalid repo', () => {
      expect(MonorepoMetadata.createNull('/')).toBeUndefined();
    });
  });

  describe('rootPackageJSON', () => {
    it('successfully returns the root package.json object', () => {
      expect(metadata.rootPackageJSON.name).toBe('rootPackageJson');
    });
  });

  describe('packageNames', () => {
    it('successfully returns repo package names', () => {
      expect(metadata.packageNames).toContain('package1');
    });
  });

  describe('getPackagePath', () => {
    it('successfully returns path for a repo package', () => {
      expect(metadata.getPackagePath('package2')).toBe(resolve('/project/packages/package2'));
    });
  });

  describe('getPackageJSON', () => {
    it('successfully returns package.json for a repo package', () => {
      const result = metadata.getPackageJSON('package1');
      expect(result.name).toBe('package1');
    });
  });

  describe('findAllDependentPackageNames', () => {
    it('successfully returns a list repo packages that are dependencies', () => {
      const result = metadata.findAllDependentPackageNames('package2');
      expect(result).toHaveLength(1);
      expect(result).toContain('package1');
    });
  });
});
