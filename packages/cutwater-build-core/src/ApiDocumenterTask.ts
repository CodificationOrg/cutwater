import { ApiDocumenterCommandLine } from '@microsoft/api-documenter/lib/cli/ApiDocumenterCommandLine';
import { GulpTask } from '@microsoft/gulp-core-build';

/**
 * @beta
 */
// tslint:disable-next-line: interface-name
export interface ApiDocumenterConfig {
  format: 'markdown' | 'yaml';
  inputFolder: string;
  outputFolder: string;
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
export class ApiDocumenterTask extends GulpTask<ApiDocumenterConfig> {
  constructor(packageName?: string) {
    super('api-documenter', {
      format: 'markdown',
      inputFolder: './temp',
      outputFolder: packageName
        ? `../../docs/${toSimplePackageName(packageName)}`
        : './temp/docs'
    });
  }

  public executeTask(): Promise<void> {
    return new ApiDocumenterCommandLine().executeWithoutErrorHandling([
      this.taskConfig.format,
      '--input-folder',
      this.taskConfig.inputFolder,
      '--output-folder',
      this.taskConfig.outputFolder
    ]);
  }
}
