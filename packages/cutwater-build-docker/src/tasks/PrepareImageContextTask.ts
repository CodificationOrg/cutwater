import { GulpTask, NodeUtils } from '@codification/cutwater-build-core';
import { resolve } from 'path';
import { DOCKERFILE, DOCKER_CONTEXT_DIRECTORY } from '../Constants';
import { ImageContext } from '../support/ImageContext';
import { ImageConfig } from '../types/ImageConfig';

export interface PrepareImageContextTaskConfig<T extends ImageConfig> {
  includes?: string[];
  configs?: T | T[];
  contextFolder: string;
}

export class PrepareImageContextTask<
  C extends ImageConfig = ImageConfig,
  T extends PrepareImageContextTaskConfig<C> = PrepareImageContextTaskConfig<C>
> extends GulpTask<T, void> {
  public constructor(name = 'prepare-image-context', defaultConfig: Partial<T> = {}) {
    super(name, {
      contextFolder: DOCKER_CONTEXT_DIRECTORY,
      ...defaultConfig,
    });
  }

  protected get imageContexts(): ImageContext<C>[] {
    return NodeUtils.toArray<C>(this.config.configs, [
      { name: '', dockerfile: resolve(this.system.dirname, DOCKERFILE) } as C,
    ]).map(config => new ImageContext<C>(this.config.contextFolder, config, this.buildConfig, this.system));
  }

  public async executeTask(): Promise<void> {
    this.imageContexts.forEach(context => context.prepare(this.config.includes));
  }
}
