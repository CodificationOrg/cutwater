import { GulpTask, NodeUtils } from '@codification/cutwater-build-core';
import { DOCKER_CONTEXT_DIRECTORY } from '../Constants';
import { ImageContext } from '../support/ImageContext';
import { ImageConfig } from '../types';

export interface PrepareImageContextTaskConfig<T extends ImageConfig> {
  includes?: string[];
  imageConfigs: T | T[];
  contextDirectory: string;
}

export class PrepareImageContextTask<
  C extends ImageConfig = ImageConfig,
  T extends PrepareImageContextTaskConfig<C> = PrepareImageContextTaskConfig<C>
> extends GulpTask<T, void> {
  public constructor(name = 'prepare-image-context', defaultConfig: Partial<T> = {}) {
    super(name, {
      contextDirectory: DOCKER_CONTEXT_DIRECTORY,
      ...defaultConfig,
    });
  }

  protected get imageContexts(): ImageContext<C>[] {
    return NodeUtils.toArray<C>(this.config.imageConfigs).map(
      config => new ImageContext<C>(this.config.contextDirectory, config, this.buildConfig, this.system),
    );
  }

  public async executeTask(): Promise<void> {
    this.imageContexts.forEach(context => context.prepare(this.config.includes));
  }
}
