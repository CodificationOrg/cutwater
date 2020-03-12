import { IOUtils } from '@codification/cutwater-build-core';
import * as gulp from 'gulp';
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

  public executeTask(localGulp: gulp.Gulp): Promise<void> {
    if (!!this.config.parameters && !!this.config.parameters.outputTemplateFile) {
      IOUtils.mkdirs(this.config.parameters.outputTemplateFile);
    }
    return super.executeTask(localGulp);
  }
}
