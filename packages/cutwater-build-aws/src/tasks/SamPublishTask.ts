import { IOUtils } from '@codification/cutwater-build-core';
import * as path from 'path';
import { SamCliTask } from './SamCliTask';

export interface SamPublishParameters {
  template?: string;
  semanticVersion?: string;
  versionFromPackage?: boolean;
}

export class SamPublishTask extends SamCliTask<SamPublishParameters> {
  public constructor() {
    super('sam-publish', 'publish');
    this.filteredParams.push('versionFromPackage');
    this.setConfig({});
    this.setParameters({
      template: './temp/aws/cloudformation/app.template.yaml',
      versionFromPackage: true,
    });
  }

  public async executeTask(): Promise<void> {
    if (!this.config.parameters?.semanticVersion && this.config.parameters?.versionFromPackage) {
      this.config.parameters.semanticVersion = this.packageVersion();
    }
    await super.executeTask();
  }

  protected packageVersion(): string | undefined {
    const pkg: any = IOUtils.readJSONSyncSafe(path.join(process.cwd(), 'package.json'));
    return pkg?.['version'];
  }
}
