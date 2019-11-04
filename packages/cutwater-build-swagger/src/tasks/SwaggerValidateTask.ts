import { GulpTask } from '@codification/cutwater-build-core';
import { Gulp } from 'gulp';
import { validate } from 'swagger-cli';

export interface SwaggerValidateTaskConfig {
  apiFile: string;
  schema: boolean;
  spec: boolean;
}

export class SwaggerValidateTask extends GulpTask<SwaggerValidateTaskConfig> {
  public constructor() {
    super('swagger-validate', {
      apiFile: './swagger/swagger.json',
      schema: true,
      spec: true,
    });
  }

  public executeTask(localGulp: Gulp): Promise<object> {
    const { apiFile, ...validateConfig } = this.config;
    return validate(apiFile, { validate: validateConfig });
  }
}
