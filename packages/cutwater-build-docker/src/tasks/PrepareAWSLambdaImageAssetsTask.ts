import { IOUtils } from '@codification/cutwater-build-core';
import { resolve } from 'path';
import { PrepareImageAssetsTask, PrepareImageAssetsTaskConfig } from './PrepareImageAssetsTask';

export interface PrepareAWSLambdaImageAssetsTaskConfig extends PrepareImageAssetsTaskConfig {
  nodeVersion: string;
  handlerName: string;
}

export class PrepareAWSLambdaImageAssetsTask extends PrepareImageAssetsTask<PrepareAWSLambdaImageAssetsTaskConfig> {
  public constructor() {
    const dockerFile = resolve(__dirname, 'AwsLambdaDockerfile');
    super('prepare-aws-lambda-image-assets', {
      dockerFile,
      nodeVersion: '18',
      handlerName: 'lambda.handler',
    });
  }

  public async executeTask(): Promise<void> {
    await super.executeTask();

    const tokens: Record<string, string> = {
      NODE_VERSION_TAG: this.config.nodeVersion,
      HANDLER_NAME: this.config.handlerName,
    };

    IOUtils.replaceTokensInTextFile(this.dockerFile, tokens);
  }
}
