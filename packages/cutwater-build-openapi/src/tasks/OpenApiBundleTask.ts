import { GulpTask } from '@codification/cutwater-build-core';
import * as gulp from 'gulp';
import { bundle } from 'swagger-cli';

export interface OpenApiBundleTaskConfig {
  apiFile: string;
  outfile: string;
  dereference: boolean;
  format: number;
  wrap: number;
  type: 'yaml' | 'json';
}

export class OpenApiBundleTask extends GulpTask<OpenApiBundleTaskConfig> {
  public constructor() {
    super('openapi-bundle', {
      apiFile: './openapi/openapi.yaml',
      outfile: './temp/openapi/openapi.json',
      dereference: true,
    });
  }

  public executeTask(localGulp: gulp.Gulp): Promise<object> {
    const { apiFile, ...bundleConfig } = this.config;
    return bundle(apiFile, bundleConfig);
  }
}
