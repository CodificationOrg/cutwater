import { AwsCliTask } from './AwsCliTask';

export interface CloudFormationPackageParameters {
  templateFile: string;
  s3Bucket: string;
  s3Prefix?: string;
  kmsKeyId?: string;
  outputTemplateFile?: string;
  useJson?: boolean;
  forceUpload?: boolean;
  metadata?: { [key: string]: string };
}

export class CloudFormationPackageTask extends AwsCliTask<CloudFormationPackageParameters> {
  public constructor() {
    super('cloudformation-package', 'cloudformation', 'package');
    this.setParameters({
      templateFile: './app.template.yaml',
      outputTemplateFile: './temp/aws/cloudformation/app.template.yaml',
    });
  }
}
