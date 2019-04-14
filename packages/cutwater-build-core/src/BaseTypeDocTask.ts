import { exec } from 'child_process';

import { GulpTask } from '@microsoft/gulp-core-build';

/**
 * @beta
 */
// tslint:disable-next-line: interface-name
export interface TypeDocConfig {
  src: string;
  out?: string;
  mode?: 'file' | 'modules';
  options?: string;
  json?: string;
  ignoreCompilerErrors?: boolean;
  exclude?: string;
  includeDeclarations?: boolean;
  externalPattern?: string;
  excludeNotExported?: boolean;
  excludePrivate?: boolean;
  excludeProtected?: boolean;
  module?: 'commonjs' | 'amd' | 'system' | 'umd';
  target?: 'ES3' | 'ES5' | 'ES6';
  tsconfig?: string;
  theme?: string;
  name?: string;
  readme?: string;
  plugin?: string;
  hideGenerator?: boolean;
  gaId?: string;
  entryPoint?: string;
  gitRevision?: string;
  includes?: string;
  media?: string;
}

/**
 * @beta
 */
export abstract class BaseTypeDocTask<T extends TypeDocConfig> extends GulpTask<
  T
> {
  public constructor(taskName: string, defaultConfig: Partial<T>) {
    super(taskName, {
      src: './src',
      // tslint:disable-next-line: no-any
      ...(defaultConfig as any)
    } as T);
  }

  public executeTask(): Promise<void> {
    return new Promise((resolve, reject) => {
      const cmd: string = `typedoc ${this.generateArgs()}`;
      this.log(`Running Typedoc: ${cmd}`);
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

  private generateArgs(): string {
    const args: string[] = [];
    const { src, ...config } = this.taskConfig;
    Object.keys(config).forEach(prop => {
      const element: string = this.toArg(`--${prop}`, this.taskConfig[prop]);
      if (element) {
        args.push(element);
      }
    });
    args.push(`"${src}"`);
    return args.join(' ');
  }

  // tslint:disable-next-line: no-any
  private toArg(argName: string, value: any): string {
    let rval: string = `${argName}`;
    if (value && typeof value === 'string') {
      rval = `${rval} "${value}"`;
    } else if (!value) {
      rval = '';
    }
    return rval;
  }
}
