import { BaseTypeDocTask, TypeDocConfig } from './BaseTypeDocTask';
import { BuildUtils } from './BuildUtils';

// tslint:disable-next-line: typedef
export const defaultConfig = (packageName?: string): Partial<TypeDocConfig> => {
  return {
    out: packageName
      ? `../../docs/api/${BuildUtils.toSimplePackageName(packageName)}`
      : './temp/docs',
    mode: 'file',
    readme: './README.md',
    includeDeclarations: true,
    ignoreCompilerErrors: false,
    exclude: '**/+(*test*|node_modules)/**',
    excludePrivate: true,
    excludeNotExported: true
  };
};

/**
 * @beta
 */
export class TypeDocTask extends BaseTypeDocTask<TypeDocConfig> {
  constructor(packageName?: string) {
    super('cutwater-typedoc', defaultConfig(packageName));
  }
}
