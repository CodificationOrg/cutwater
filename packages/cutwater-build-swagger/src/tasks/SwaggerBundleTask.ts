import { GulpTask } from '@codification/cutwater-build-core';
import * as gulp from 'gulp';
import { bundle } from 'swagger-cli';

export interface SwaggerBundleTaskConfig {
  apiFile: string;
  outfile: string;
  dereference: boolean;
  format: number;
  wrap: number;
  type: 'yaml' | 'json';
}

export class SwaggerBundleTask extends GulpTask<SwaggerBundleTaskConfig> {
  public constructor() {
    super('swagger-bundle', {
      apiFile: './swagger/swagger.yaml',
      outfile: './temp/swagger.json',
      dereference: true,
    });
  }

  public executeTask(localGulp: gulp.Gulp): Promise<object> {
    const { apiFile, ...bundleConfig } = this.config;
    return bundle(apiFile, bundleConfig);
  }
}
