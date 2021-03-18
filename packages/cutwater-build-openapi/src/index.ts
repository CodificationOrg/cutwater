import { ExecutableTask, task } from '@codification/cutwater-build-core';
import { OpenApiBundleTask } from './tasks/OpenApiBundleTask';
import { OpenApiValidateTask } from './tasks/OpenApiValidateTask';

export const openapiBundle: ExecutableTask<unknown> = new OpenApiBundleTask();
export const openapiValidate: ExecutableTask<unknown> = new OpenApiValidateTask();

task('openapi-bundle', openapiBundle);
task('openapi-validate', openapiValidate);
