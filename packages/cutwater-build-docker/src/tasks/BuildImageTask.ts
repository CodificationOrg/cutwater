import { GulpTask, IOUtils, RunCommand, RunCommandConfig } from '@codification/cutwater-build-core';
import { PackageJSON } from '@codification/cutwater-build-core/lib/State';
import { join } from 'path';
import { PrepareImageAssetsTask } from './PrepareImageAssetsTask';

export interface BuildImageTaskConfig extends RunCommandConfig {
  name?: string;
  platform: string;
  dockerFile: string;
  tempAssetDirectory: string;
}

export class BuildImageTask extends GulpTask<BuildImageTaskConfig, void> {
  public constructor() {
    super('build-image', {
      platform: 'linux/amd64',
      dockerFile: PrepareImageAssetsTask.DOCKERFILE,
      tempAssetDirectory: 'docker',
    });
  }

  public get imageName(): string {
    if (this.config.name) {
      return this.config.name;
    }
    const pkgObj = IOUtils.readJSONSyncSafe<PackageJSON>(PrepareImageAssetsTask.PACKAGE_JSON, this.buildConfig);
    if (!pkgObj.name) {
      throw new Error('No image name provided and no name found in packag.json.');
    }
    return pkgObj.name;
  }

  public get dockerFolder(): string {
    const { tempFolder } = this.buildConfig;
    const { tempAssetDirectory } = this.config;
    return IOUtils.resolvePath(join(tempFolder, tempAssetDirectory), this.buildConfig);
  }

  public get dockerFile(): string {
    return join(this.dockerFolder, PrepareImageAssetsTask.DOCKERFILE);
  }

  public async executeTask(): Promise<void> {
    await new RunCommand().run({
      logger: this.logger(),
      ...this.config,
      command: 'docker',
      args: `build --file ${this.dockerFile} -t ${this.imageName} --platform ${this.config.platform} ${this.dockerFolder}`,
    });
  }
}
