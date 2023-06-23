import { GulpTask, PACKAGE_JSON, Spawn, SpawnOptions } from '@codification/cutwater-build-core';
import { PackageJSON } from '@codification/cutwater-build-core/lib/types/PackageJSON';

export interface TagAndPushImageTaskConfig extends SpawnOptions {
  spawn: Spawn;
  name?: string;
  repo?: string;
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
    const pkgObj = this.system.toFileReference(PACKAGE_JSON).readObjectSyncSafe<PackageJSON>();
    if (!pkgObj.name) {
      throw new Error('No image name provided and no name found in packag.json.');
    }
    return pkgObj.name;
  }

  public async executeTask(): Promise<void> {
    const { repo: rawRepo, stage } = this.config;
    const image = `${this.imageName}:latest`;
    const repo = rawRepo ? `${rawRepo}/${this.imageName}` : undefined;
    const buildNumber = this.buildState.buildNumber(-1);
    const buildTag = `${stage}-build-${buildNumber !== -1 ? buildNumber : await this.buildState.gitRev()}`;

    for (const tag of ['latest', buildTag, stage]) {
      await this.config.spawn.execute({
        ...this.config,
        command: 'docker',
        args: `tag ${image} ${repo || this.imageName}:${tag}`,
      });
      if (repo) {
        await this.config.spawn.execute({
          ...this.config,
          command: 'docker',
          args: `push ${repo}:${tag}`,
        });
      }
    }
  }
}
