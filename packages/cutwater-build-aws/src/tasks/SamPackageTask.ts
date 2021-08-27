import { ApiGatewayDeploymentUpdater } from '../cloudformation/ApiGatewayDeploymentUpdater';
import { SamCliTask } from './SamCliTask';

export interface SamPackageParameters {
  templateFile: string;
  s3Bucket: string;
  s3Prefix?: string;
  imageRepository?: string;
  kmsKeyId?: string;
  signingProfiles?: string[];
  outputTemplateFile: string;
  useJson?: boolean;
  forceUpload?: boolean;
  metadata?: { [key: string]: string };
}

export class SamPackageTask extends SamCliTask<SamPackageParameters> {
  public constructor() {
    super('sam-package', 'package');
    this.setParameters({
      templateFile: './app.template.yaml',
      outputTemplateFile: './temp/aws/cloudformation/app.template.yaml',
    });
  }

  public async executeTask(): Promise<void> {
    if (!!this.config.parameters) {
      this.createOutputDir(this.config.parameters.outputTemplateFile);
    }
    await super.executeTask();
    if (!!this.config.parameters) {
      const updater = new ApiGatewayDeploymentUpdater();
      updater.load(this.config.parameters.outputTemplateFile);
      updater.performOpenApiMerges(this.config.parameters.outputTemplateFile);
    }
  }
}
