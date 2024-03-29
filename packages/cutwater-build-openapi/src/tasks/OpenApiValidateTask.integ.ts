import { OpenApiValidateTask } from './OpenApiValidateTask';

describe('OpenApiValidateTask', () => {
  const task: OpenApiValidateTask = new OpenApiValidateTask();
  task.setConfig({ apiFile: './test/openapi.yaml' });

  it('the openapi file is validated', async () => {
    const result = await task.executeTask();
    expect(result).toBeTruthy();
  });
});
