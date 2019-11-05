import { RunCommandTask, RunCommandTaskConfig } from '@codification/cutwater-build-core';

export interface CloudFormationPackageTaskConfig extends RunCommandTaskConfig {
  templateFile: string;
  outputFile: string;
  s3Bucket: string;
}

export class CloudFormationPackageTask extends RunCommandTask<CloudFormationPackageTaskConfig> {
  public constructor() {
    super('cloudformation-package', {
      templateFile: './cf-template.yaml',
      outputFile: './temp/aws/cloudformation/cf-template-packaged.yaml',
    });
  }

  protected preparedCommand(): string {
    return `aws cloudformation package \
    --template-file ${this.config.templateFile} \
    --output-template-file ${this.config.outputFile} \
    --s3-bucket ${this.config.s3Bucket}`;
  }
}
