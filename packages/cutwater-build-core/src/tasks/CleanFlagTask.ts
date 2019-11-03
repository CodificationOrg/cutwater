import * as gulp from 'gulp';
import { BuildConfig } from '../BuildConfig';
import { CleanTask } from './CleanTask';

export class CleanFlagTask extends CleanTask {
  private finished: boolean = false;

  constructor() {
    super();
  }

  public isEnabled(buildConfig: BuildConfig): boolean {
    return (
      // tslint:disable-next-line: no-string-literal
      (!!buildConfig.args['clean'] || !!buildConfig.args['c']) && this.finished === false
    );
  }

  public executeTask(localGulp: gulp.Gulp, completeCallback: (error?: string | Error) => void): void {
    super.executeTask(localGulp, () => {
      this.finished = true;
      completeCallback();
    });
  }
}
