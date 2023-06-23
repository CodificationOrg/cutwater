import { NodeUtils, TextUtils } from '@codification/cutwater-build-core';
import {
  PrepareImageContextTask,
  PrepareImageContextTaskConfig,
} from '@codification/cutwater-build-docker/lib/tasks/PrepareImageContextTask';
import { ImageConfig } from '@codification/cutwater-build-docker/lib/types/ImageConfig';
import { resolve } from 'path';

export interface HandlerImageConfig extends ImageConfig {
  handler: string;
  options?: string | string[];
  dockerfile?: string;
}

export interface PrepareLambdaImageContextTaskConfig extends PrepareImageContextTaskConfig<HandlerImageConfig> {
  nodeVersion: string;
}

export class PrepareLambdaImageContextTask<
  T extends PrepareLambdaImageContextTaskConfig = PrepareLambdaImageContextTaskConfig
> extends PrepareImageContextTask<HandlerImageConfig, T> {
  public static readonly DEFAULT_DOCKERFILE = 'AwsLambdaDockerfile';

  public constructor(name = 'prepare-lambda-image-context', defaultConfig: Partial<T> = {}) {
    super(name, {
      nodeVersion: '18',
      ...defaultConfig,
    });
  }

  private toOptions(config: HandlerImageConfig): string {
    if (!config.options) {
      return '';
    }
    return TextUtils.combineToMultilineText(NodeUtils.toArray<string>(config.options));
  }

  private processDockerfiles(): void {
    this.imageContexts.forEach(context => {
      context.dockerfile.replaceTokens({
        NODE_VERSION_TAG: this.config.nodeVersion,
        HANDLER_NAME: context.imageConfig.handler,
        OPTIONS: this.toOptions(context.imageConfig),
      });
    });
  }

  private processHandlerImageConfigs(): void {
    const configs = NodeUtils.toArray<HandlerImageConfig>(this.config.imageConfigs, [
      {
        name: '',
        handler: 'lambda.handler',
      },
    ]);
    configs.forEach(config => {
      if (!config.dockerfile) {
        config.dockerfile = resolve(__dirname, PrepareLambdaImageContextTask.DEFAULT_DOCKERFILE);
      }
    });
  }

  public async executeTask(): Promise<void> {
    this.processHandlerImageConfigs();
    await super.executeTask();
    this.processDockerfiles();
  }
}
