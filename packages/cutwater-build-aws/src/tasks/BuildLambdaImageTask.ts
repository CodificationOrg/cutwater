import { IOUtils, NodeUtils, TextUtils } from '@codification/cutwater-build-core';
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
  options?: string | string[];
}

export interface BuildLambdaImageTaskConfig extends BuildImageTaskConfig {
  nodeVersion: string;
  imageConfigs: HandlerImageConfig | HandlerImageConfig[];
}

export class BuildLambdaImageTask<
  T extends BuildLambdaImageTaskConfig = BuildLambdaImageTaskConfig,
> extends BuildImageTask<T> {
  private static readonly DEFAULT_DOCKERFILE = 'AwsLambdaDockerfile';
  private static readonly DOCKERFILES_FOLDER = 'dockerfiles';

  public constructor(name = 'build-lambda-image', defaultConfig: Partial<T> = {}) {
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

  protected toDockerFilePath(config: ImageConfig): string {
    if (config.dockerFile && isAbsolute(config.dockerFile)) {
      return config.dockerFile;
    } else if (config.dockerFile) {
      return IOUtils.resolvePath(config.dockerFile, this.buildConfig);
    }
    return resolve(__dirname, BuildLambdaImageTask.DEFAULT_DOCKERFILE);
  }

  private toOptions(config: HandlerImageConfig): string {
    if (!config.options) {
      return '';
    }
    return TextUtils.combineToMultilineText(NodeUtils.toArray<string>(config.options));
  }

  private generateTempDockefile(config: HandlerImageConfig): string {
    const rval = this.toTempDockerfilePath(config);
    copyFileSync(this.toDockerFilePath(config), rval);
    IOUtils.replaceTokensInTextFile(rval, {
      NODE_VERSION_TAG: this.config.nodeVersion,
      HANDLER_NAME: config.handler,
      OPTIONS: this.toOptions(config),
    });
    return rval;
  }

  private processHandlerImageConfigs(): void {
    const configs = NodeUtils.toArray<HandlerImageConfig>(this.config.imageConfigs);
    configs.forEach((config) => {
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
