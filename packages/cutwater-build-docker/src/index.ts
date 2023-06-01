import { ExecutableTask, task } from '@codification/cutwater-build-core';
import { BuildImageTask } from './tasks/BuildImageTask';
import { PrepareImageContextTask } from './tasks/PrepareImageContextTask';
import { TagAndPushImageTask } from './tasks/TagAndPushImageTask';

export * from './Constants';

export const prepareImageContextTask: ExecutableTask<unknown> = new PrepareImageContextTask();
export const buildImageTask: ExecutableTask<unknown> = new BuildImageTask();
export const tagAndPushImageTask: ExecutableTask<unknown> = new TagAndPushImageTask();

task('prepare-image-context', prepareImageContextTask);
task('build-image', buildImageTask);
task('tag-and-push-image', tagAndPushImageTask);
