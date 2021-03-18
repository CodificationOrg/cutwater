import { IOUtils } from '@codification/cutwater-build-core';
import { OpenApiBundleTask } from './OpenApiBundleTask';

afterAll(() => IOUtils.rmdirs('temp/test'));

describe('OpenApiBundleTask', () => {
  it('bundles the api files', async () => {
    const task: OpenApiBundleTask = new OpenApiBundleTask();
    task.setConfig({ apiFile: './test/openapi.yaml', outfile: 'temp/test/compiled.yaml', type: 'yaml' });
    await task.executeTask();
    expect(IOUtils.fileExists(task.config.outfile)).toBeTruthy();
  });

  it('skips the task when api file is not found', async () => {
    const task: OpenApiBundleTask = new OpenApiBundleTask();
    await task.executeTask();
    expect(IOUtils.fileExists(task.config.outfile)).toBeFalsy();
  });
});
