import { AwsCliTask } from './AwsCliTask';

export interface CloudFormationDeployParameters {
  templateFile: string;
  stackName: string;
  s3Bucket?: string;
  s3Prefix?: string;
  kmsKeyId?: string;
  parameterOverrides?: string[];
  capabilities?: string[];
  forceUpload?: boolean;
  noExecuteChangeset?: boolean;
  roleArn?: string;
  notificationArns?: string[];
  failOnEmptyChangeset?: boolean;
  noFailOnEmptyChangeset?: boolean;
  tags: string[];
}

export class CloudFormationDeployTask extends AwsCliTask<CloudFormationDeployParameters> {
  public constructor() {
    super('cloudformation-package', 'cloudformation', 'package');
    this.setParameters({
      templateFile: './temp/aws/cloudformation/app.template.yaml',
    });
  }
}
