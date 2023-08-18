import gulp from 'gulp';
import prettier from 'gulp-prettier';
import { Options as PrettierTaskConfig } from 'prettier';

import { GulpTask } from './GulpTask';

export { PrettierTaskConfig };

export class PrettierTask extends GulpTask<PrettierTaskConfig, void> {
  constructor() {
    super('prettier', {
      printWidth: 120,
      trailingComma: 'all',
      singleQuote: true,
    });
  }

  public executeTask(localGulp: gulp.Gulp): NodeJS.ReadWriteStream {
    return localGulp
      .src([`${this.buildConfig.srcFolder}/**/*.ts`, `${this.buildConfig.srcFolder}/**/*.js`])
      .pipe(prettier(this.config))
      .pipe(localGulp.dest(this.buildConfig.srcFolder));
  }
}
