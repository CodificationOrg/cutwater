import { GulpTask } from '@codification/cutwater-build-core';
import { getFlagValue } from '@codification/cutwater-build-core/lib/State';
import * as gulp from 'gulp';
import * as eslint from 'gulp-eslint';

export class EsLintTask extends GulpTask<any, void> {
  public constructor() {
    super('esLint', {});
  }

  public executeTask(localGulp: gulp.Gulp): NodeJS.ReadWriteStream {
    return localGulp
      .src(`${this.buildConfig.srcFolder}/**/*.ts`)
      .pipe(
        eslint({
          fix: getFlagValue('fix'),
        }),
      )
      .pipe(eslint.format())
      .pipe(eslint.failAfterError());
  }
}
