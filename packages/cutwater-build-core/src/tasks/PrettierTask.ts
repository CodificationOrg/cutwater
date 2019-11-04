import * as gulp from 'gulp';
import { default as prettier } from 'gulp-prettier';
import { Options } from 'prettier';
import { GulpTask } from './GulpTask';

// tslint:disable-next-line:no-empty-interface
export interface PrettierTaskConfig extends Options {}

export class PrettierTask extends GulpTask<PrettierTaskConfig> {
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
