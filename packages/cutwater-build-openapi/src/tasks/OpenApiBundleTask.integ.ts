import { BuildContext, System } from '@codification/cutwater-build-core';
import { OpenApiBundleTask } from './OpenApiBundleTask';

afterAll(() =>
  System.create()
    .toFileReference('temp/test')
    .delete(true),
);

describe('OpenApiBundleTask', () => {
  it('bundles the api files', async () => {
    const task: OpenApiBundleTask = new OpenApiBundleTask();
    task.setConfig({ apiFile: './test/openapi.yaml', outfile: 'temp/test/compiled.yaml', type: 'yaml' });
    await task.execute(BuildContext.create());
    expect(task.buildContext.buildState.system.fileExists(task.config.outfile)).toBeTruthy();
  });

  it('skips the task when api file is not found', async () => {
    const task: OpenApiBundleTask = new OpenApiBundleTask();
    await task.executeTask();
    expect(task.buildContext.buildState.system.fileExists(task.config.outfile)).toBeFalsy();
  });
});
