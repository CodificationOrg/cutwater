import { ExecutableTask, serial, task } from '@codification/cutwater-build-core';
import { openapiBundle } from '@codification/cutwater-build-openapi';
import { CloudFormationDeployTask } from './tasks/CloudFormationDeployTask';
import { CloudFormationPackageTask } from './tasks/CloudFormationPackageTask';
import { S3CopyTask } from './tasks/S3CopyTask';

export const s3CopyTask: ExecutableTask<unknown> = new S3CopyTask();
export const cfPackageTask: ExecutableTask<unknown> = new CloudFormationPackageTask();
export const cfDeployTask: ExecutableTask<unknown> = new CloudFormationDeployTask();
export const openApiCfPackageTasks: ExecutableTask<unknown> = serial(openapiBundle, cfPackageTask);
export const openApiCfDeployTasks: ExecutableTask<unknown> = serial(openApiCfPackageTasks, cfDeployTask);

task('s3-copy', s3CopyTask);
task('cloudformation-package', cfPackageTask);
task('cloudformation-deploy', cfDeployTask);
task('openapi-cf-package', openApiCfPackageTasks);
task('openapi-cf-deploy', openApiCfDeployTasks);
