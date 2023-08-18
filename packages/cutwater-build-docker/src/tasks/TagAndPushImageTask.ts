import { GulpTask, Spawn, SpawnOptions } from '@codification/cutwater-build-core';

export interface TagAndPushImageTaskConfig extends SpawnOptions {
  spawn: Spawn;
  name: string;
  repo?: string;
  stage: string;
}

export class TagAndPushImageTask extends GulpTask<TagAndPushImageTaskConfig, void> {
  public constructor() {
    super('tag-and-push-image', {
      spawn: Spawn.create(),
      stage: 'dev',
    });
  }

  public async executeTask(): Promise<void> {
    const { repo: rawRepo, stage } = this.config;
    const image = `${this.config.name}:latest`;
    const repo = rawRepo ? `${rawRepo}/${this.config.name}` : undefined;
    const buildNumber = this.buildState.buildNumber(-1);
    const buildTag = `${stage}-build-${buildNumber !== -1 ? buildNumber : await this.buildState.gitRev()}`;

    for (const tag of ['latest', buildTag, stage]) {
      await this.config.spawn.execute({
        ...this.config,
        command: 'docker',
        args: `tag ${image} ${repo || this.config.name}:${tag}`,
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
