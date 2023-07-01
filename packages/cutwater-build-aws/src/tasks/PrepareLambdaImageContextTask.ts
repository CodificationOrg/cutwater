import { FileReference, NodeUtils, Spawn, TextUtils } from '@codification/cutwater-build-core';
import { ImageContext } from '@codification/cutwater-build-docker/lib/support/ImageContext';
import {
  PrepareImageContextTask,
  PrepareImageContextTaskConfig,
} from '@codification/cutwater-build-docker/lib/tasks/PrepareImageContextTask';
import { ImageConfig } from '@codification/cutwater-build-docker/lib/types/ImageConfig';
import { HttpService, IOUtils } from '@codification/cutwater-node-core';
import { resolve } from 'path';
import { CliUtils } from '../support/CliUtils';

export interface LayerConfig {
  layerName: string;
  versionNumber: number;
  region: string;
}

export interface HandlerImageConfig extends ImageConfig {
  handler: string;
  options?: string | string[];
  dockerfile?: string;
  layers?: LayerConfig | LayerConfig[];
}

export interface PrepareLambdaImageContextTaskConfig extends PrepareImageContextTaskConfig<HandlerImageConfig> {
  nodeVersion: string;
  spawn: Spawn;
  http: HttpService;
}

export class PrepareLambdaImageContextTask<
  T extends PrepareLambdaImageContextTaskConfig = PrepareLambdaImageContextTaskConfig
> extends PrepareImageContextTask<HandlerImageConfig, T> {
  public static readonly DEFAULT_DOCKERFILE = 'AwsLambdaDockerfile';

  public constructor(name = 'prepare-lambda-image-context', defaultConfig: Partial<T> = {}) {
    super(name, {
      nodeVersion: '18',
      spawn: Spawn.create(),
      http: new HttpService(),
      ...defaultConfig,
    });
  }

  private toOptions(config: HandlerImageConfig): string {
    if (!config.options) {
      return '';
    }
    return TextUtils.combineToMultilineText(NodeUtils.toArray<string>(config.options));
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

  private toAwsCommandArgs(layer: LayerConfig): string {
    return CliUtils.prepareArgs(
      {
        parameters: {
          ...layer,
        },
        spawnOptions: { command: 'aws' },
      },
      { command: 'lambda', subCommand: 'get-layer-version' },
    );
  }

  private async toLayerUrl(layer: LayerConfig): Promise<string> {
    const args = this.toAwsCommandArgs(layer);
    this.log(`Requesting layer url with args: ${args}`);
    return JSON.parse(
      (
        await this.config.spawn.execute({
          logger: this.logger(),
          command: 'aws',
          quiet: false,
          ignoreErrors: false,
          cwd: this.system.cwd(),
          args,
        })
      ).toString('utf-8'),
    ).Content.Location;
  }

  private toLayerName(layer: LayerConfig): string {
    return `${layer.layerName}-${layer.versionNumber}`;
  }

  private toLayerFileReference(layer: LayerConfig): FileReference {
    return this.system.toFileReference(resolve(this.cacheFolder().path, `${this.toLayerName(layer)}.zip`));
  }

  private toLayerDirectoryReference(layer: LayerConfig): FileReference {
    return this.system.toFileReference(
      resolve(this.contextDirectoryReference().path, 'layers', `${this.toLayerName(layer)}`),
    );
  }

  private async downloadLayer(layer: LayerConfig): Promise<FileReference> {
    const layerFile = this.toLayerFileReference(layer);
    if (!layerFile.exists()) {
      const url = await this.toLayerUrl(layer);
      await this.config.http.downloadToFile(url, layerFile.path);
    }
    return layerFile;
  }

  private findRequiredLayers(): LayerConfig[] {
    const rval = NodeUtils.toArray<HandlerImageConfig>(this.config.imageConfigs).reduce<Record<string, LayerConfig>>(
      (rval, img) => {
        NodeUtils.toArray<LayerConfig>(img.layers).forEach(layer => {
          rval[`${this.toLayerName(layer)}`] = layer;
        });
        return rval;
      },
      {},
    );
    return Object.values(rval);
  }

  private async prepareLayers(): Promise<void> {
    this.system.mkdir(this.cacheFolder().path, true);
    const layers = this.findRequiredLayers();
    if (layers.length < 1) {
      return;
    }
    await Promise.all(
      layers.map(layer =>
        this.downloadLayer(layer).then(file => {
          const layerDir = resolve(this.toLayerDirectoryReference(layer).path);
          this.system.mkdir(layerDir, true);
          IOUtils.unzip(file.path, layerDir);
        }),
      ),
    );
  }

  private toLayersCopyCommands(imageContext: ImageContext<HandlerImageConfig>): string {
    const layers = NodeUtils.toArray<LayerConfig>(imageContext.imageConfig.layers);
    if (layers.length < 1) {
      return '';
    }
    const copyCommands: string[] = layers.map(layer => `COPY layers/${this.toLayerName(layer)}/ /`);
    return TextUtils.combineToMultilineText(copyCommands);
  }

  private processDockerfiles(): void {
    this.imageContexts.forEach(context => {
      context.dockerfile.replaceTokens({
        NODE_VERSION_TAG: this.config.nodeVersion,
        HANDLER_NAME: context.imageConfig.handler,
        LAYERS: this.toLayersCopyCommands(context),
        OPTIONS: this.toOptions(context.imageConfig),
      });
    });
  }

  public async executeTask(): Promise<void> {
    this.processHandlerImageConfigs();
    await super.executeTask();
    await this.prepareLayers();
    this.processDockerfiles();
  }
}
