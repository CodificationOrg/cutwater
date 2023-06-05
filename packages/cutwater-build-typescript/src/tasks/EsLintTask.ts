import { GulpTask, getBuildState } from '@codification/cutwater-build-core';
import gulp from 'gulp';
import eslint from 'gulp-eslint';

export class EsLintTask extends GulpTask<any, void> {
  public constructor() {
    super('esLint', {});
  }

  public executeTask(localGulp: gulp.Gulp): NodeJS.ReadWriteStream {
    return localGulp
      .src(`${this.buildConfig.srcFolder}/**/*.ts`)
      .pipe(
        eslint({
          fix: getBuildState().getFlagValue('fix'),
        }),
      )
      .pipe(eslint.format())
      .pipe(eslint.failAfterError());
  }
}
