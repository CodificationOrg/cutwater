import * as del from 'del';
import * as gulp from 'gulp';

import { BuildConfig } from '../BuildConfig';
import { GulpTask } from './GulpTask';

export class CleanTask extends GulpTask<void> {
  constructor() {
    super('clean');
  }

  public executeTask(localGulp: gulp.Gulp, completeCallback: (error?: string | Error) => void): void {
    const { distFolder, libFolder, libAMDFolder, tempFolder }: BuildConfig = this.buildConfig;
    let cleanPaths: string[] = [distFolder, libFolder, tempFolder];

    if (libAMDFolder) {
      cleanPaths.push(libAMDFolder);
    }

    (this.buildConfig.uniqueTasks || []).forEach(executable => {
      if (executable.getCleanMatch) {
        cleanPaths = cleanPaths.concat(executable.getCleanMatch(this.buildConfig));
      }
    });

    try {
      del.sync([...new Set(cleanPaths)]);
      completeCallback();
    } catch (e) {
      completeCallback(e);
    }
  }
}
