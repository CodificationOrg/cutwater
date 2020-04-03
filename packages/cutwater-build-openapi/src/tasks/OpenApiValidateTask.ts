import { GulpTask } from '@codification/cutwater-build-core';
import { Gulp } from 'gulp';
import { validate } from 'swagger-cli';

export interface OpenApiValidateTaskConfig {
  apiFile: string;
  schema: boolean;
  spec: boolean;
}

export class OpenApiValidateTask extends GulpTask<OpenApiValidateTaskConfig> {
  public constructor() {
    super('openapi-validate', {
      apiFile: './openapi/openapi.json',
      schema: true,
      spec: true,
    });
  }

  public executeTask(localGulp: Gulp): Promise<object> {
    const { apiFile, ...validateConfig } = this.config;
    return validate(apiFile, { validate: validateConfig });
  }
}
