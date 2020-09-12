import { GulpTask } from '@codification/cutwater-build-core';
import * as gulp from 'gulp';
import eslint from 'gulp-eslint';

export class EsLintTask extends GulpTask<any> {
  public constructor() {
    super('tsLint', {});
  }

  public executeTask(localGulp: gulp.Gulp): NodeJS.ReadWriteStream {
    return localGulp
      .src(`${this.buildConfig.srcFolder}/**/*.ts`)
      .pipe(eslint.format())
      .pipe(eslint.failAfterError());
  }
}
