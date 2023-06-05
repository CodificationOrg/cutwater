import del from 'del';

import { BuildConfig } from '../types';
import { GulpTask } from './GulpTask';

export interface CleanTaskConfig {
  force: boolean;
}

export class CleanTask extends GulpTask<CleanTaskConfig, string[]> {
  constructor() {
    super('clean');
  }

  public executeTask(): Promise<string[]> {
    const { distFolder, libFolder, tempFolder }: BuildConfig = this.buildConfig;
    const cleanPaths: Set<string> = new Set([distFolder, libFolder, tempFolder]);

    (this.buildConfig.uniqueTasks || []).forEach((executable) => {
      if (executable.getCleanMatch && executable.getCleanMatch(this.buildConfig)) {
        executable.getCleanMatch(this.buildConfig).forEach((path) => cleanPaths.add(path));
      }
    });
    return del(Array.from(cleanPaths), this.config);
  }
}
