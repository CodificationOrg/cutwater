import { GulpTask } from '@codification/cutwater-build-core';
import * as gulp from 'gulp';
import tslintPlugin from 'gulp-tslint';

export class TsLintTask extends GulpTask<any> {
  public constructor() {
    super('tsLint', {});
  }

  public executeTask(localGulp: gulp.Gulp): NodeJS.ReadWriteStream {
    return localGulp
      .src(`${this.buildConfig.srcFolder}/**/*.ts`)
      .pipe(
        tslintPlugin({
          formatter: 'verbose',
        }),
      )
      .pipe(tslintPlugin.report());
  }
}
