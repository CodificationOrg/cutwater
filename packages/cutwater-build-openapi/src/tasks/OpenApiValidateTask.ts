import { GulpTask } from '@codification/cutwater-build-core';
import { validate } from 'swagger-cli';

export interface OpenApiValidateTaskConfig {
  apiFile: string;
  schema: boolean;
  spec: boolean;
}

export class OpenApiValidateTask extends GulpTask<OpenApiValidateTaskConfig, Record<string, unknown>> {
  public constructor() {
    super('openapi-validate', {
      apiFile: './openapi/openapi.json',
      schema: true,
      spec: true,
    });
  }

  public executeTask(): Promise<Record<string, unknown>> {
    const { apiFile, ...validateConfig } = this.config;
    return validate(apiFile, { validate: validateConfig });
  }
}
