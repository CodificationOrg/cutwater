import { exec } from 'child_process';

import { GulpTask } from '@microsoft/gulp-core-build';

/**
 * @beta
 */
// tslint:disable-next-line: interface-name
export interface TypeDocConfig  {
  src: string;
  out?: string;
  mode?: 'file'|'modules';
  options?: string;
  json?: string;
  ignoreCompilerErrors?: boolean;
  exclude?: string;
  includeDeclarations?: boolean;
  externalPattern?: string;
  excludeNotExported?: boolean;
  excludePrivate?: boolean;
  excludeProtected?: boolean;
  module?: 'commonjs'|'amd'|'system'|'umd';
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

const toSimplePackageName: Function = (packageName: string): string => {
  let rval: string = packageName;
  const sepIndex: number = packageName.indexOf('/');
  if (sepIndex !== -1 && packageName.indexOf('@') === 0) {
    rval = packageName.substring(sepIndex + 1);
  }
  return rval;
};

/**
 * @beta
 */
export class TypeDocTask<T extends TypeDocConfig> extends GulpTask<T> {
  constructor(packageName?: string) {
    super('typedoc', {
      src: './src',
      out: packageName
        ? `../../docs/${toSimplePackageName(packageName)}`
        : './temp/docs',
      mode: 'file',
      readme: './README.md',
      includeDeclarations: true,
      ignoreCompilerErrors: false,
      exclude: '**/+(*test*|node_modules)/**'
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
    const {src, ... config} = this.taskConfig;
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
