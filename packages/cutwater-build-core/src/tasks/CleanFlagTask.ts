import { BuildConfig } from '../BuildConfig';
import { CleanTask } from './CleanTask';

const FLAGS: string[] = ['clean', 'c'];

export class CleanFlagTask extends CleanTask {
  private finished = false;

  constructor() {
    super();
  }

  public isEnabled(buildConfig: BuildConfig): boolean {
    return (!!buildConfig.args[FLAGS[0]] || !!buildConfig.args[FLAGS[1]]) && !this.finished;
  }

  public executeTask(): Promise<string[]> {
    return super.executeTask().then((result) => {
      this.finished = true;
      return result;
    });
  }
}
