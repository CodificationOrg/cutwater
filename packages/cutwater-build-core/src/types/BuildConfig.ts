import * as gulp from 'gulp';
import { NpmClient } from '../core/Constants';
import { MonorepoMetadata } from '../support/MonorepoMetadata';
import { ExecutableTask } from './ExecutableTask';

export interface BuildConfig {
  maxBuildTimeMs: number;
  gulp: gulp.Gulp;
  uniqueTasks: ExecutableTask<unknown>[];
  rootPath: string;
  repoMetadata?: MonorepoMetadata;
  npmClient?: NpmClient;
  lockFile?: string;
  packageFolder: string;
  srcFolder: string;
  libFolder: string;
  libAMDFolder?: string;
  libES6Folder?: string;
  libESNextFolder?: string;
  distFolder: string;
  tempFolder: string;
  cacheFolder: string;
  relogIssues?: boolean;
  showToast?: boolean;
  buildSuccessIconPath?: string;
  buildErrorIconPath?: string;
  verbose: boolean;
  production: boolean;
  shouldWarningsFailBuild: boolean;
  args: { [name: string]: string | boolean };
  properties?: { [key: string]: unknown };
  onTaskStart?: (taskName: string) => void;
  onTaskEnd?: (taskName: string, duration: number[], error?: Error) => void;
  isRedundantBuild?: boolean;
  jestEnabled?: boolean;
}
