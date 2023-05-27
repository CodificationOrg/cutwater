import { EnvUtils, GulpTask, IOUtils, RunCommand, RunCommandConfig } from '@codification/cutwater-build-core';
import { PackageJSON } from '@codification/cutwater-build-core/lib/State';
import { PrepareImageAssetsTask } from './PrepareImageAssetsTask';

export interface TagAndPushImageTaskConfig extends RunCommandConfig {
  name?: string;
  repo: string;
  stage: string;
}

export class TagAndPushImageTask extends GulpTask<TagAndPushImageTaskConfig, void> {
  public constructor() {
    super('tag-and-push-image', {
      stage: 'dev',
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

  public async executeTask(): Promise<void> {
    const { repo: rawRepo, stage } = this.config;
    const image = `${this.imageName}:latest`;
    const repo = `${rawRepo}/${this.imageName}`;
    const buildNumber = EnvUtils.buildNumber(-1);
    const buildTag = `${stage}-build-${buildNumber !== -1 ? buildNumber : await EnvUtils.gitRev()}`;

    for (const tag of ['latest', buildTag, stage]) {
      await new RunCommand().run({
        ...this.config,
        command: 'docker',
        args: `tag ${image} ${repo}:${tag}`,
      });
      await new RunCommand().run({
        ...this.config,
        command: 'docker',
        args: `push ${repo}:${tag}`,
      });
    }
  }
}
