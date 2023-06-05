import { IOUtils, NodeUtils, TextUtils } from '@codification/cutwater-build-core';
import { DOCKERFILE } from '@codification/cutwater-build-docker';
import {
  ImageConfig,
  PrepareImageContextTask,
  PrepareImageContextTaskConfig,
} from '@codification/cutwater-build-docker/lib/tasks/PrepareImageContextTask';
import { copyFileSync } from 'fs';
import { isAbsolute, join, resolve } from 'path';

export interface HandlerImageConfig extends Omit<ImageConfig, 'dockerfile'> {
  handler: string;
  options?: string | string[];
  dockerfile?: string;
}

export interface PrepareLambdaImageContextTaskConfig extends PrepareImageContextTaskConfig {
  nodeVersion: string;
  imageConfigs?: HandlerImageConfig | HandlerImageConfig[];
}

export class PrepareLambdaImageContextTask<
  T extends PrepareLambdaImageContextTaskConfig = PrepareLambdaImageContextTaskConfig,
> extends PrepareImageContextTask<T> {
  private static readonly DEFAULT_DOCKERFILE = 'AwsLambdaDockerfile';

  public constructor(name = 'prepare-lambda-image-context', defaultConfig: Partial<T> = {}) {
    super(name, {
      nodeVersion: '18',
      ...defaultConfig,
    });
  }

  private toTempDockerfilePath(config: HandlerImageConfig): string {
    const tempFolder = join(this.buildConfig.tempFolder, PrepareLambdaImageContextTask.DOCKERFILES_FOLDER);
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
    return resolve(__dirname, PrepareLambdaImageContextTask.DEFAULT_DOCKERFILE);
  }

  private toOptions(config: HandlerImageConfig): string {
    if (!config.options) {
      return '';
    }
    return TextUtils.combineToMultilineText(NodeUtils.toArray<string>(config.options));
  }

  protected copyDockerfiles(): string[] {
    const rval = super.copyDockerfiles();
    rval.forEach((dockerfile) => {
      IOUtils.replaceTokensInTextFile(dockerfile, {
        NODE_VERSION_TAG: this.config.nodeVersion,
        HANDLER_NAME: config.handler,
        OPTIONS: this.toOptions(config),
      });
    });
    return rval;
  }

  private processHandlerImageConfigs(): void {
    const configs = NodeUtils.toArray<HandlerImageConfig>(this.config.imageConfigs, [
      {
        name: '',
        handler: 'lambda.handler',
      },
    ]);
    configs.forEach((config) => {
      if (!config.dockerfile) {
        config.dockerfile = resolve(__dirname, PrepareLambdaImageContextTask.DEFAULT_DOCKERFILE);
      }
    });
  }

  public async executeTask(): Promise<void> {
    this.processHandlerImageConfigs();
    await super.executeTask();
  }
}
