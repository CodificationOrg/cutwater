import { ApiDocumenterCommandLine } from '@microsoft/api-documenter/lib/cli/ApiDocumenterCommandLine';
import { GulpTask } from '@microsoft/gulp-core-build';

// tslint:disable-next-line: interface-name
export interface ApiDocumenterConfig {
  format: 'markdown' | 'yaml';
  inputFolder: string;
  outputFolder: string;
}

export class ApiDocumenterTask extends GulpTask<ApiDocumenterConfig> {
  constructor() {
    super('api-documenter', {
      format: 'markdown',
      inputFolder: './temp',
      outputFolder: './docs'
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
