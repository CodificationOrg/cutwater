import { IOUtils } from '@codification/cutwater-build-core';
import * as gulp from 'gulp';
import { OpenApiBundleTask } from './OpenApiBundleTask';

describe('OpenApiBundleTask', () => {
  const task: OpenApiBundleTask = new OpenApiBundleTask();
  task.setConfig({ apiFile: './test/openapi.yaml', outfile: './temp/compiled.yaml', type: 'yaml' });

  it('the openapi file is bundled', async () => {
    const result = await task.executeTask(gulp);
    expect(result).toBeTruthy();
    expect(IOUtils.fileExists('./temp/compiled.yaml')).toBeTruthy();
  });
});
