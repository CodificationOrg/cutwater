import { ExecutableTask, task } from '@codification/cutwater-build-core';
import { OpenApiBundleTask } from './tasks/OpenApiBundleTask';
import { OpenApiValidateTask } from './tasks/OpenApiValidateTask';

export const openapiBundle: ExecutableTask = new OpenApiBundleTask();
export const openapiValidate: ExecutableTask = new OpenApiValidateTask();

task('openapi-bundle', openapiBundle);
task('openapi-validate', openapiValidate);
