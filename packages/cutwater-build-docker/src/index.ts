import { ExecutableTask, task } from '@codification/cutwater-build-core';
import { PrepareImageAssetsTask } from './tasks/PrepareImageAssetsTask';

export const prepareImageAssets: ExecutableTask<unknown> = new PrepareImageAssetsTask();

task('prepare-image-assets', prepareImageAssets);
