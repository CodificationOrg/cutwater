import { ExecutableTask, serial, task } from '@codification/cutwater-build-core';
import { openapiBundle } from '@codification/cutwater-build-openapi';
import { CloudFormationDeployTask } from './tasks/CloudFormationDeployTask';
import { CloudFormationPackageTask } from './tasks/CloudFormationPackageTask';
import { S3CopyTask } from './tasks/S3CopyTask';
import { SamPackageTask } from './tasks/SamPackageTask';
import { SamPublishTask } from './tasks/SamPublishTask';

export const s3CopyTask: ExecutableTask<unknown> = new S3CopyTask();
export const samPackageTask: ExecutableTask<unknown> = new SamPackageTask();
export const samPublishTask: ExecutableTask<unknown> = new SamPublishTask();
export const cfPackageTask: ExecutableTask<unknown> = new CloudFormationPackageTask();
export const cfDeployTask: ExecutableTask<unknown> = new CloudFormationDeployTask();
export const openApiCfPackageTasks: ExecutableTask<unknown> = serial(openapiBundle, cfPackageTask);
export const openApiCfDeployTasks: ExecutableTask<unknown> = serial(openApiCfPackageTasks, cfDeployTask);

task('s3-copy', s3CopyTask);
task('sam-package', samPackageTask);
task('sam-publish', samPublishTask);
task('sam-package-publish', serial(samPackageTask, samPublishTask));
task('cloudformation-package', cfPackageTask);
task('cloudformation-deploy', cfDeployTask);
task('openapi-cf-package', openApiCfPackageTasks);
task('openapi-cf-deploy', openApiCfDeployTasks);
