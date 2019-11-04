import { default as globEscape } from 'glob-escape';
import { Gulp } from 'gulp';
import * as path from 'path';

import { GulpTask } from './GulpTask';

export interface CopyStaticAssetsTaskConfig {
  includeExtensions?: string[];
  excludeExtensions?: string[];
  includeFiles?: string[];
  excludeFiles?: string[];
}

export class CopyStaticAssetsTask extends GulpTask<CopyStaticAssetsTaskConfig> {
  constructor() {
    super('copy-static-assets', {
      includeExtensions: [],
      excludeExtensions: [],
      includeFiles: [],
      excludeFiles: [],
    });
  }

  public executeTask(gulp: Gulp): NodeJS.ReadWriteStream {
    const rootPath: string = path.join(this.buildConfig.rootPath, this.buildConfig.srcFolder || 'src');
    const libPath: string = path.join(this.buildConfig.rootPath, this.buildConfig.libFolder || 'lib');

    const globPatterns: string[] = [];

    const allExtensions: string[] = (this.config.includeExtensions || []).concat(['json', 'html', 'css', 'md']);

    allExtensions.forEach(ext => {
      if (!this.config.excludeExtensions || this.config.excludeExtensions.indexOf(ext) === -1) {
        if (!ext.match(/^\./)) {
          ext = `.${ext}`;
        }
        globPatterns.push(path.join(rootPath, '**', `*${globEscape(ext)}`));
      }
    });

    for (const file of this.config.includeFiles || []) {
      if (this.config.excludeFiles) {
        if (this.config.excludeFiles.indexOf(file) !== -1) {
          break; // Skipping this file. It's been excluded
        }
      }

      globPatterns.push(path.join(rootPath, file));
    }

    for (const file of this.config.excludeFiles || []) {
      globPatterns.push(`!${path.join(rootPath, file)}`);
    }

    return gulp.src(globPatterns, { base: rootPath }).pipe(gulp.dest(libPath));
  }
}
