import { ExecutableTask, task } from '@codification/cutwater-build-core';
import { CloudFormationPackageTask } from './tasks/CloudFormationPackageTask';

export const cfPackage: ExecutableTask = new CloudFormationPackageTask();

task('cloudformation-package', cfPackage);
