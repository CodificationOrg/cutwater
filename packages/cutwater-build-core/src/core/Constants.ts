export const PACKAGE_JSON = 'package.json';

export type NpmClient = 'npm' | 'yarn';
export const YARN_LOCK_FILE = 'yarn.lock';
export const NPM_LOCK_FILE = 'package-lock.json';
export const LOCK_FILES = [YARN_LOCK_FILE, NPM_LOCK_FILE];
export const LOCK_FILE_MAPPING: Record<string, NpmClient> = {
  [NPM_LOCK_FILE]: 'npm',
  [YARN_LOCK_FILE]: 'yarn',
};

export const DIST_FOLDER = 'dist';
export const LIB_FOLDER = 'lib';
export const TEMP_FODLER = 'temp';

export const RELOG_ISSUES_FLAG = 'relogIssues';
export const SHOW_TOAST_FLAG = 'showToast';
export const VERBOSE_FLAG = 'verbose';
export const PRODUCTION_FLAG = 'production';

export const SUCCESS_ICON = 'pass.png';
export const FAIL_ICON = 'fail.png';
