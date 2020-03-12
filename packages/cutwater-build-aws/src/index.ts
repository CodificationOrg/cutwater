import { ExecutableTask, task } from '@codification/cutwater-build-core';
import { CloudFormationDeployTask } from './tasks/CloudFormationDeployTask';
import { CloudFormationPackageTask } from './tasks/CloudFormationPackageTask';
import { S3CopyTask } from './tasks/S3CopyTask';

export const s3Copy: ExecutableTask = new S3CopyTask();

task('s3-copy', s3Copy);

export const cfPackage: ExecutableTask = new CloudFormationPackageTask();
export const cfDeploy: ExecutableTask = new CloudFormationDeployTask();

task('cloudformation-package', cfPackage);
task('cloudformation-deplooy', cfDeploy);
