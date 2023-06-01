export const PACKAGE_JSON = 'package.json';

export type NpmClient = 'npm' | 'yarn';
export const YARN_LOCK_FILE = 'yarn.lock';
export const NPM_LOCK_FILE = 'package-lock.json';
export const LOCK_FILES = [YARN_LOCK_FILE, NPM_LOCK_FILE];
export const LOCK_FILE_MAPPING: Record<string, NpmClient> = {
  [NPM_LOCK_FILE]: 'npm',
  [YARN_LOCK_FILE]: 'yarn',
};
