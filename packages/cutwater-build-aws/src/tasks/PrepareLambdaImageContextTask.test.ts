import { BuildContext } from '@codification/cutwater-build-core';
import { join, resolve } from 'path';
import { PrepareLambdaImageContextTask } from './PrepareLambdaImageContextTask';
import { DOCKERFILE } from '@codification/cutwater-build-docker';

let context: BuildContext;
const name = 'prepare-lambda-image-context';

beforeEach(() => {
  context = BuildContext.createNull();
  const { system } = context.buildState;
  system.mkdir(__dirname, true);
  system.toFileReference(resolve(__dirname, PrepareLambdaImageContextTask.DEFAULT_DOCKERFILE)).write(`
  FROM public.ecr.aws/lambda/nodejs:\${NODE_VERSION_TAG}

  COPY package.json yarn.lock ./
  COPY packages/ ./packages/
  
  RUN npm install -g yarn &&\
    yarn install
  
  \${OPTIONS}
  
  CMD [ "packages/app/lib/\${HANDLER_NAME}" ]
  `);
});

describe('PrepareLambdaImageContextTask', () => {
  describe('execute', () => {
    it('prepares a docker context to host a lambda function', async () => {
      const task: PrepareLambdaImageContextTask = new PrepareLambdaImageContextTask();
      task.setConfig({
        imageConfigs: { name, handler: 'lambda.handler', options: 'RUN echo "hello world"' },
      });
      await task.execute(context);
      const contextDirectory = context.buildState.system.toFileReference(
        join(`${task.buildConfig.tempFolder}`, `${task.config.contextDirectory}`),
      );
      const dockerfile = context.buildState.system.toFileReference(
        join(contextDirectory.path, `${DOCKERFILE}.${name}`),
      );
      expect(dockerfile.exists()).toBeTruthy();
      expect(dockerfile.read().indexOf('hello world')).toBeGreaterThan(0);
    });
  });
});
