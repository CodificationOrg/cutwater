import { AwsCliTask, AwsCliTaskConfig } from './AwsCliTask';

export interface CloudFormationPackageTaskConfig extends AwsCliTaskConfig {
  templateFile: string;
  outputFile: string;
  s3Bucket: string;
}

export class CloudFormationPackageTask extends AwsCliTask<CloudFormationPackageTaskConfig> {
  public constructor() {
    super('cloudformation-package', {
      awsCommand: 'cloudformation',
      subCommand: 'package',
      templateFile: './app.template.yaml',
      outputFile: './temp/aws/cloudformation/app.template.yaml',
    });
  }

  protected preparedParameters(): string {
    return `--template-file ${this.config.templateFile} \
    --output-template-file ${this.config.outputFile} \
    --s3-bucket ${this.config.s3Bucket}`;
  }
}
