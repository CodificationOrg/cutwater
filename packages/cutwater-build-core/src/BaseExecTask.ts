import { exec } from 'child_process';

import { GulpTask } from '@microsoft/gulp-core-build';

/**
 * @beta
 */
export abstract class BaseExecTask<T> extends GulpTask<T> {
  protected cmdName: string;
  protected argNames: string[];
  protected optsUseEquals: boolean;

  public constructor(
    cmdName: string,
    taskName: string,
    defaultConfig: Partial<T>,
    optsUseEquals: boolean = false,
    // tslint:disable-next-line: missing-optional-annotation
    ...argNames: string[]
  ) {
    super(taskName, {
      ...defaultConfig
    } as T);
    this.cmdName = cmdName;
    this.optsUseEquals = optsUseEquals;
    this.argNames = argNames || [];
  }

  public executeTask(): Promise<void> {
    return new Promise((resolve, reject) => {
      const cmd: string = `${this.cmdName}${this.options()}${this.args()}`;
      this.log(`Running [${this.cmdName}]: ${cmd}`);
      exec(cmd, (err, stdout, stderr) => {
        this.log(stdout);
        this.log(stderr);
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  private args(): string {
    const rval: string[] = [];
    Object.keys(this.taskConfig)
      .filter(prop => this.argNames.indexOf(prop) !== -1)
      .forEach(prop => {
        const arg: string = this.taskConfig[prop];
        if (arg) {
          rval.push(arg);
        }
      });
    return rval.length > 0 ? ` ${rval.join(' ')}` : '';
  }

  private options(): string {
    const rval: string[] = [];
    Object.keys(this.taskConfig)
      .filter(prop => this.argNames.indexOf(prop) === -1)
      .forEach(prop => {
        const element: string = this.toOption(
          `--${prop}`,
          this.taskConfig[prop]
        );
        if (element) {
          rval.push(element);
        }
      });
    return rval.length > 0 ? ` ${rval.join(' ')}` : '';
  }

  // tslint:disable-next-line: no-any
  private toOption(argName: string, value: any): string {
    let rval: string = `${argName}`;
    if (!value) {
      rval = '';
    } else if (typeof value === 'string') {
      rval = `${rval}${this.optsUseEquals ? '=' : ' '}"${value}"`;
    } else if (Array.isArray(value)) {
      rval = value.map(val => this.toOption(argName, val)).join(' ');
    }
    return rval;
  }
}
