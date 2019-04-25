import { BaseExecTask } from './BaseExecTask';

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
export abstract class BaseTypeDocTask<
  T extends TypeDocConfig
> extends BaseExecTask<T> {
  public constructor(taskName: string, defaultConfig: Partial<T>) {
    super(
      'typedoc',
      taskName,
      {
        src: './src',
        // tslint:disable-next-line: no-any
        ...(defaultConfig as any)
      } as T,
      false,
      'src'
    );
  }
}
