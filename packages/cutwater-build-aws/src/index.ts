import { ExecutableTask, serial, task } from '@codification/cutwater-build-core';
import { openapiBundle } from '@codification/cutwater-build-openapi';
import { CloudFormationDeployTask } from './tasks/CloudFormationDeployTask';
import { CloudFormationPackageTask } from './tasks/CloudFormationPackageTask';
import { S3CopyTask } from './tasks/S3CopyTask';

export const s3CopyTask: ExecutableTask = new S3CopyTask();
export const cfPackageTask: ExecutableTask = new CloudFormationPackageTask();
export const cfDeployTask: ExecutableTask = new CloudFormationDeployTask();
export const openApiCfPackageTasks: ExecutableTask = serial(openapiBundle, cfPackageTask);
export const openApiCfDeployTasks: ExecutableTask = serial(openApiCfPackageTasks, cfDeployTask);

task('s3-copy', s3CopyTask);
task('cloudformation-package', cfPackageTask);
task('cloudformation-deploy', cfDeployTask);
task('openapi-cf-package', openApiCfPackageTasks);
task('openapi-cf-deploy', openApiCfDeployTasks);
