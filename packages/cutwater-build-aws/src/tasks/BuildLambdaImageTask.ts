import { IOUtils } from '@codification/cutwater-build-core';
import { DOCKERFILE } from '@codification/cutwater-build-docker';
import {
  BuildImageTask,
  BuildImageTaskConfig,
  ImageConfig,
} from '@codification/cutwater-build-docker/lib/tasks/BuildImageTask';
import { copyFileSync } from 'fs';
import { isAbsolute, join, resolve } from 'path';

export interface HandlerImageConfig extends ImageConfig {
  handler: string;
}

export interface BuildLambdaImageTaskConfig extends BuildImageTaskConfig {
  nodeVersion: string;
  imageConfigs: HandlerImageConfig | HandlerImageConfig[];
}

export class BuildLambdaImageTask<
  T extends BuildLambdaImageTaskConfig = BuildLambdaImageTaskConfig
> extends BuildImageTask<T> {
  private static readonly DEFAULT_DOCKERFILE = 'AwsLambdaDockerfile';
  private static readonly DOCKERFILES_FOLDER = 'dockerfiles';

  public constructor(name = 'prepare-aws-lambda-image-assets', defaultConfig: Partial<T> = {}) {
    super(name, {
      nodeVersion: '18',
      imageConfigs: {
        name: '',
        handler: 'lambda.handler',
      },
      ...defaultConfig,
    });
  }

  private toTempDockerfilePath(config: HandlerImageConfig): string {
    const tempFolder = join(this.buildConfig.tempFolder, BuildLambdaImageTask.DOCKERFILES_FOLDER);
    IOUtils.mkdirs(tempFolder, this.buildConfig);
    const tempPath = join(tempFolder, `${DOCKERFILE}.${config.name}`);
    return IOUtils.resolvePath(tempPath, this.buildConfig);
  }

  public toDockerFilePath(config: ImageConfig): string {
    if (config.dockerFile && isAbsolute(config.dockerFile)) {
      return config.dockerFile;
    } else if (config.dockerFile) {
      return IOUtils.resolvePath(config.dockerFile, this.buildConfig);
    }
    return resolve(__dirname, BuildLambdaImageTask.DEFAULT_DOCKERFILE);
  }

  private generateTempDockefile(config: HandlerImageConfig): string {
    const rval = this.toTempDockerfilePath(config);
    copyFileSync(this.toDockerFilePath(config), rval);
    IOUtils.replaceTokensInTextFile(rval, {
      NODE_VERSION_TAG: this.config.nodeVersion,
      HANDLER_NAME: config.handler,
    });
    return rval;
  }

  private processHandlerImageConfigs(): void {
    const configs: HandlerImageConfig[] = Array.isArray(this.config.imageConfigs)
      ? this.config.imageConfigs
      : [this.config.imageConfigs];

    configs.forEach(config => {
      if (!config.name) {
        throw new Error('An image name is required.');
      }
      if (!config.dockerFile) {
        config.dockerFile = this.generateTempDockefile(config);
      }
    });
  }

  public async executeTask(): Promise<void> {
    this.processHandlerImageConfigs();
    await super.executeTask();
  }
}
