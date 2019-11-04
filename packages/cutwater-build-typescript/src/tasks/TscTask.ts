import { GulpTask } from '@codification/cutwater-build-core';
import * as gulp from 'gulp';
import * as ts from 'gulp-typescript';

export class TscTask extends GulpTask<any> {
  public constructor() {
    super('tsc', {});
  }

  public executeTask(localGulp: gulp.Gulp): NodeJS.ReadWriteStream {
    const tsProject = ts.createProject('tsconfig.json', this.customArgs());
    const tsResult = localGulp.src(`${this.buildConfig.srcFolder}/**/*.ts`).pipe(tsProject());
    return tsResult.js.pipe(localGulp.dest(this.outputFolder()));
  }

  private outputFolder(): string {
    const args: object = this.customArgs();
    // tslint:disable-next-line:no-string-literal
    return args['outDir'] ? args['outDir'] : this.buildConfig.libFolder;
  }

  private customArgs(): object {
    return this.config.customArgs ? this.config.customArgs : {};
  }
}
