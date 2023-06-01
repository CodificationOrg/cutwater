import { ExecutableTask, serial, task } from '@codification/cutwater-build-core';
import { buildImageTask, tagAndPushImageTask } from '@codification/cutwater-build-docker';
import { buildTasks } from '@codification/cutwater-build-node';
import { openapiBundle } from '@codification/cutwater-build-openapi';
import { CloudFormationDeployTask } from './tasks/CloudFormationDeployTask';
import { CloudFormationPackageTask } from './tasks/CloudFormationPackageTask';
import { EcrLoginTask } from './tasks/EcrLoginTask';
import { BuildLambdaImageTask } from './tasks/BuildLambdaImageTask';
import { S3CopyTask } from './tasks/S3CopyTask';
import { SamPackageTask } from './tasks/SamPackageTask';
import { SamPublishTask } from './tasks/SamPublishTask';

export const ecrLoginTask: ExecutableTask<unknown> = new EcrLoginTask();
export const s3CopyTask: ExecutableTask<unknown> = new S3CopyTask();
export const samPackageTask: ExecutableTask<unknown> = new SamPackageTask();
export const samPublishTask: ExecutableTask<unknown> = new SamPublishTask();
export const cfPackageTask: ExecutableTask<unknown> = new CloudFormationPackageTask();
export const cfDeployTask: ExecutableTask<unknown> = new CloudFormationDeployTask();
export const prepareLambdaImageAssetsTask: ExecutableTask<unknown> = new BuildLambdaImageTask();

export const openApiCfPackageTasks: ExecutableTask<unknown> = serial(openapiBundle, cfPackageTask);
export const openApiCfDeployTasks: ExecutableTask<unknown> = serial(openApiCfPackageTasks, cfDeployTask);

export const buildDockerLambdaTask: ExecutableTask<unknown> = serial(buildTasks, prepareLambdaImageAssetsTask);
export const packageDockerLambdaTask: ExecutableTask<unknown> = serial(buildDockerLambdaTask, buildImageTask);
export const publishDockerLambdaTask: ExecutableTask<unknown> = serial(
  packageDockerLambdaTask,
  ecrLoginTask,
  tagAndPushImageTask,
);

task('s3-copy', s3CopyTask);
task('ecr-login', ecrLoginTask);
task('prepare-lambda-image-assets', prepareLambdaImageAssetsTask);
task('sam-package', samPackageTask);
task('sam-publish', samPublishTask);
task('sam-package-publish', serial(samPackageTask, samPublishTask));
task('cloudformation-package', cfPackageTask);
task('cloudformation-deploy', cfDeployTask);
task('openapi-cf-package', openApiCfPackageTasks);
task('openapi-cf-deploy', openApiCfDeployTasks);
task('build-docker-lambda', buildDockerLambdaTask);
task('package-docker-lambda', packageDockerLambdaTask);
task('publish-docker-lambda', publishDockerLambdaTask);
