import { BaseTypeDocTask, TypeDocConfig } from './BaseTypeDocTask';

const toSimplePackageName: Function = (packageName: string): string => {
  let rval: string = packageName;
  const sepIndex: number = packageName.indexOf('/');
  if (sepIndex !== -1 && packageName.indexOf('@') === 0) {
    rval = packageName.substring(sepIndex + 1);
  }
  return rval;
};

// tslint:disable-next-line: typedef
export const defaultConfig = (packageName?: string): Partial<TypeDocConfig> => {
  return {
    out: packageName
      ? `../../docs/${toSimplePackageName(packageName)}`
      : './temp/docs',
    mode: 'file',
    readme: './README.md',
    includeDeclarations: true,
    ignoreCompilerErrors: false,
    exclude: '**/+(*test*|node_modules)/**',
    excludePrivate: true
  };
};

/**
 * @beta
 */
export class TypeDocTask extends BaseTypeDocTask<TypeDocConfig> {
  constructor(packageName?: string) {
    super('typedoc', defaultConfig(packageName));
  }
}
