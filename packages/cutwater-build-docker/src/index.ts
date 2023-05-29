import { ExecutableTask, task } from '@codification/cutwater-build-core';
import { BuildImageTask } from './tasks/BuildImageTask';
import { PrepareImageAssetsTask } from './tasks/PrepareImageAssetsTask';
import { TagAndPushImageTask } from './tasks/TagAndPushImageTask';

export const prepareImageAssetsTask: ExecutableTask<unknown> = new PrepareImageAssetsTask();
export const buildImageTask: ExecutableTask<unknown> = new BuildImageTask();
export const tagAndPushImageTask: ExecutableTask<unknown> = new TagAndPushImageTask();

task('prepare-image-assets', prepareImageAssetsTask);
task('build-image', buildImageTask);
task('tag-and-push-image', tagAndPushImageTask);
