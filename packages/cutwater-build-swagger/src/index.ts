import { ExecutableTask, task } from '@codification/cutwater-build-core';

import { SwaggerBundleTask } from './tasks/SwaggerBundleTask';
import { SwaggerValidateTask } from './tasks/SwaggerValidateTask';

export const swaggerBundle: ExecutableTask = new SwaggerBundleTask();
export const swaggerValidate: ExecutableTask = new SwaggerValidateTask();

task('swagger-bundle', swaggerBundle);
task('swagger-validate', swaggerValidate);
