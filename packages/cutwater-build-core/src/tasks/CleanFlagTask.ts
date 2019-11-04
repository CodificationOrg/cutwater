import * as gulp from 'gulp';
import { BuildConfig } from '../BuildConfig';
import { CleanTask } from './CleanTask';

const FLAGS: string[] = ['clean', 'c'];

export class CleanFlagTask extends CleanTask {
  private finished: boolean = false;

  constructor() {
    super();
  }

  public isEnabled(buildConfig: BuildConfig): boolean {
    return (!!buildConfig.args[FLAGS[0]] || !!buildConfig.args[FLAGS[1]]) && !this.finished;
  }

  public executeTask(localGulp: gulp.Gulp): Promise<string[]> {
    return super.executeTask(localGulp).then(result => {
      this.finished = true;
      return result;
    });
  }
}
