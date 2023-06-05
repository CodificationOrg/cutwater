import { Gulp } from 'gulp';
import { getConfig } from '.';
import { GulpTask } from './tasks/GulpTask';
import { CustomGulpTask } from './types';

export class CustomTask extends GulpTask<void, unknown> {
  private customTask: CustomGulpTask;
  constructor(name: string, fn: CustomGulpTask) {
    super(name);
    this.customTask = fn.bind(this);
  }

  public executeTask(
    localGulp: Gulp,
    completeCallback?: (error?: string | Error) => void,
  ): Promise<unknown> | NodeJS.ReadWriteStream | void {
    return this.customTask(localGulp, getConfig(), completeCallback);
  }
}
