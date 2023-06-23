import { BuildContext, Spawn } from '@codification/cutwater-build-core';
import { PrepareImageContextTask } from '@codification/cutwater-build-docker/lib/tasks/PrepareImageContextTask';
import { TestContext } from '@codification/cutwater-test';
import { basename, dirname } from 'path';
import { PrepareLambdaImageContextTask } from './PrepareLambdaImageContextTask';

let ctx: TestContext;
let contextFolder: string;
let buildContext: BuildContext;
const name = 'build-lambda-image-test-image';

beforeAll(async () => {
  ctx = TestContext.createContext();
  buildContext = BuildContext.create();
  contextFolder = basename(dirname(ctx.createTempFilePath()));
  const task = new PrepareImageContextTask();
  task.setConfig({ contextFolder });
  await task.execute(buildContext);
}, 60000);

afterAll(async () => {
  ctx.teardown();
  await Spawn.create().execute({ command: 'docker', args: ['image', 'rm', name] });
});

describe('BuildLambdaImageTask', () => {
  describe('executeTask', () => {
    it('builds a docker image to host a lambda function', async () => {
      const task: PrepareLambdaImageContextTask = new PrepareLambdaImageContextTask();
      task.setConfig({
        imageConfigs: { name, handler: 'lambda.handler', options: 'RUN echo "hello world"' },
        contextFolder,
      });
      await task.execute(buildContext);
      const result = (await Spawn.create().execute({ command: 'docker', args: 'images' })).toString('utf-8');
      expect(result.indexOf(name)).toBeTruthy();
    }, 60000);
  });
});
