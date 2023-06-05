import { RunCommand, executeTaskTest } from '@codification/cutwater-build-core';
import { PrepareImageContextTask } from '@codification/cutwater-build-docker/lib/tasks/PrepareImageContextTask';
import { TestContext } from '@codification/cutwater-test';
import { basename, dirname } from 'path';
import { PrepareLambdaImageContextTask } from './PrepareLambdaImageContextTask';

let ctx: TestContext;
let contextFolder: string;
const name = 'build-lambda-image-test-image';

beforeAll(async () => {
  ctx = TestContext.createContext();
  contextFolder = basename(dirname(ctx.createTempFilePath()));
  const task = new PrepareImageContextTask();
  task.setConfig({ contextFolder });
  await executeTaskTest(task);
}, 60000);

afterAll(async () => {
  ctx.teardown();
  await new RunCommand().run({ command: 'docker', args: ['image', 'rm', name] });
});

describe('BuildLambdaImageTask', () => {
  describe('executeTask', () => {
    it('builds a docker image to host a lambda function', async () => {
      const task: PrepareLambdaImageContextTask = new PrepareLambdaImageContextTask();
      task.setConfig({
        imageConfigs: { name, handler: 'lambda.handler', options: 'RUN echo "hello world"' },
        contextFolder,
      });
      await executeTaskTest(task);
      const result = (await new RunCommand().run({ command: 'docker', args: 'images' })).toString('utf-8');
      expect(result.indexOf(name)).toBeTruthy();
    }, 60000);
  });
});
