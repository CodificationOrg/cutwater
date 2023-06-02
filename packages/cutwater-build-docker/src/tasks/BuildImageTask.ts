import { GulpTask, IOUtils, RunCommand, RunCommandConfig } from '@codification/cutwater-build-core';
import { isAbsolute, resolve } from 'path';
import { DOCKERFILE, DOCKER_CONTEXT_FOLDER } from '../Constants';
import { DockerUtils } from '../support/DockerUtils';

export interface ImageConfig {
  name: string;
  dockerFile?: string;
}

export interface BuildImageTaskConfig extends RunCommandConfig {
  platform: string;
  contextFolder: string;
  imageConfigs: ImageConfig | ImageConfig[];
}

export class BuildImageTask<T extends BuildImageTaskConfig = BuildImageTaskConfig> extends GulpTask<T, void> {
  public constructor(name = 'build-image', defaultConfig: Partial<T> = {}) {
    super(name, {
      platform: 'linux/amd64',
      contextFolder: DOCKER_CONTEXT_FOLDER,
      imageConfigs: {
        name: '',
      },
      ...defaultConfig,
    });
  }

  protected get contextFolderPath(): string {
    return DockerUtils.toContextFolderPath(this.config.contextFolder, this.buildConfig);
  }

  protected toDockerFilePath(config: ImageConfig): string {
    if (config.dockerFile && isAbsolute(config.dockerFile)) {
      return config.dockerFile;
    } else if (config.dockerFile) {
      return IOUtils.resolvePath(config.dockerFile, this.buildConfig);
    }
    return resolve(__dirname, DOCKERFILE);
  }

  public async executeTask(): Promise<void> {
    const configs: ImageConfig[] = Array.isArray(this.config.imageConfigs)
      ? this.config.imageConfigs
      : [this.config.imageConfigs];
    const builds = configs.map(config => {
      if (!config.name) {
        throw new Error('An image name is required.');
      }
      return new RunCommand().run({
        logger: this.logger(),
        ...this.config,
        command: 'docker',
        args: `build -t ${config.name} --platform ${this.config.platform} -f ${this.toDockerFilePath(config)} ${
          this.contextFolderPath
        }`,
      });
    });
    await Promise.all(builds);
  }
}
