import { BuildConfig, GulpTask } from '@codification/cutwater-build-core';
import * as gulp from 'gulp';
import * as sourcemaps from 'gulp-sourcemaps';
import * as ts from 'gulp-typescript';
import { ICompileStream, Project } from 'gulp-typescript/release/project';
import * as merge from 'merge-stream';
import { Readable } from 'stream';

export class TscTask extends GulpTask<any> {
  public constructor() {
    super('tsc', {});
  }

  public getCleanMatch(buildConfig: BuildConfig, taskConfig: any = this.config): string[] {
    const rval: string[] = super.getCleanMatch(buildConfig, taskConfig) || [];
    if (rval.indexOf(this.outputFolder(buildConfig)) === -1) {
      rval.push(this.outputFolder(buildConfig));
    }
    return rval;
  }

  public executeTask(localGulp: gulp.Gulp): NodeJS.ReadWriteStream | void {
    const tsProject: Project = ts.createProject('tsconfig.json', this.customArgs);

    let baseStream: any = localGulp.src(`${this.buildConfig.srcFolder}/**/*.ts`);
    if (this.sourceMapsEnabled(tsProject)) {
      baseStream = baseStream.pipe(sourcemaps.init());
    }
    const compiledStream: ICompileStream = baseStream.pipe(tsProject());

    const streams: Readable[] = [compiledStream.js];
    if (this.declarationsEnabled(tsProject)) {
      streams.push(compiledStream.dts);
    }

    let rval: NodeJS.ReadWriteStream = merge(...streams);
    if (this.sourceMapsEnabled(tsProject)) {
      rval = rval.pipe(sourcemaps.write('.'));
    }
    return rval.pipe(localGulp.dest(this.outputFolder()));
  }

  private sourceMapsEnabled(project: Project): boolean {
    return (
      project.options !== undefined && project.options.sourceMap !== undefined && project.options.sourceMap === true
    );
  }

  private declarationsEnabled(project: Project): boolean {
    return (
      project.options !== undefined && project.options.declaration !== undefined && project.options.declaration === true
    );
  }

  private outputFolder(buildConfig: BuildConfig = this.buildConfig): string {
    // tslint:disable-next-line: no-string-literal
    return this.customArgs['outDir'] || buildConfig.libFolder;
  }

  private get customArgs(): object {
    return this.config.customArgs || {};
  }
}
