import { FileReference, GulpTask, NodeUtils } from '@codification/cutwater-build-core';
import { ImageContext } from '../support/ImageContext';
import { ImageConfig } from '../types';

export interface PrepareImageContextTaskConfig<T extends ImageConfig> {
  includes?: string[];
  imageConfigs: T | T[];
}

export class PrepareImageContextTask<
  C extends ImageConfig = ImageConfig,
  T extends PrepareImageContextTaskConfig<C> = PrepareImageContextTaskConfig<C>,
> extends GulpTask<T, void> {
  public constructor(name = 'prepare-image-context', defaultConfig: Partial<T> = {}) {
    super(name, {
      ...defaultConfig,
    });
  }

  protected get imageContexts(): ImageContext<C>[] {
    return NodeUtils.toArray<C>(this.config.imageConfigs).map(
      (config) => new ImageContext<C>(config, this.buildConfig, this.system),
    );
  }

  protected contextDirectoryReference(): FileReference {
    return this.system.toFileReference(this.buildConfig.distFolder);
  }

  public async executeTask(): Promise<void> {
    this.imageContexts.forEach((context) => context.prepare(this.config.includes));
  }
}
