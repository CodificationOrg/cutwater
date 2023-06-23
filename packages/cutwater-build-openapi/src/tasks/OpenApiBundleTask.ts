import { GulpTask } from '@codification/cutwater-build-core';
import { bundle } from 'swagger-cli';

export interface OpenApiBundleTaskConfig {
  apiFile: string;
  outfile: string;
  dereference: boolean;
  format: number;
  wrap: number;
  type: 'yaml' | 'json';
}

export class OpenApiBundleTask extends GulpTask<OpenApiBundleTaskConfig, void> {
  public constructor() {
    super('openapi-bundle', {
      apiFile: './openapi/openapi.yaml',
      outfile: './temp/openapi/openapi.json',
      dereference: true,
    });
  }

  public async executeTask(): Promise<void> {
    const { apiFile, ...bundleConfig } = this.config;
    const { system } = this.buildContext.buildState;
    if (system.fileExists(apiFile)) {
      this.createOutputDir(this.config.outfile);
      await bundle(apiFile, bundleConfig);
    } else {
      this.log(`Skipping bundle, api file not found: ${system.toFileReference(apiFile).path}`);
    }
  }
}
