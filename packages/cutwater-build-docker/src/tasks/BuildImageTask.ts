import { GulpTask, Spawn, SpawnOptions } from '@codification/cutwater-build-core';
import { DOCKERFILE } from '../Constants';
import { ImageContext } from '../support/ImageContext';
import { ImageConfig } from '../types';

export interface BuildImageTaskConfig extends SpawnOptions {
  spawn: Spawn;
  platform: string;
  imageConfigs: ImageConfig | ImageConfig[];
}

export class BuildImageTask<T extends BuildImageTaskConfig = BuildImageTaskConfig> extends GulpTask<T, void> {
  public constructor(name = 'build-image', defaultConfig: Partial<T> = {}) {
    super(name, {
      spawn: Spawn.create(),
      platform: 'linux/amd64',
      imageConfigs: {
        name: '',
        dockerfile: DOCKERFILE,
      },
      ...defaultConfig,
    });
  }

  public async executeTask(): Promise<void> {
    const { platform } = this.config;
    const imageConfigs: ImageConfig[] = Array.isArray(this.config.imageConfigs)
      ? this.config.imageConfigs
      : [this.config.imageConfigs];

    const builds = imageConfigs.map((imageConfig) => {
      if (!imageConfig.name) {
        throw new Error('An image name is required.');
      }
      const context = new ImageContext(imageConfig, this.buildConfig, this.system);
      const args = `build -t ${imageConfig.name} --platform ${platform} -f ${context.dockerfile.path} ${context.contextDirectory.path}`;
      return this.config.spawn.execute({
        logger: this.logger(),
        ...this.config,
        command: 'docker',
        args,
      });
    });
    await Promise.all(builds);
  }
}
