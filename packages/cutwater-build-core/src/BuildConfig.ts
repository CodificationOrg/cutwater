import * as gulp from 'gulp';
import { ExecutableTask } from './ExecutableTask';

export interface BuildConfig {
  maxBuildTimeMs: number;
  gulp: gulp.Gulp;
  uniqueTasks?: ExecutableTask[];
  rootPath: string;
  packageFolder: string;
  srcFolder: string;
  libFolder: string;
  libAMDFolder?: string;
  libES6Folder?: string;
  libESNextFolder?: string;
  distFolder: string;
  tempFolder: string;
  relogIssues?: boolean;
  showToast?: boolean;
  buildSuccessIconPath?: string;
  buildErrorIconPath?: string;
  verbose: boolean;
  production: boolean;
  shouldWarningsFailBuild: boolean;
  args: { [name: string]: string | boolean };
  properties?: { [key: string]: any };
  onTaskStart?: (taskName: string) => void;
  onTaskEnd?: (taskName: string, duration: number[], error?: any) => void;
  isRedundantBuild?: boolean;
  jestEnabled?: boolean;
}
