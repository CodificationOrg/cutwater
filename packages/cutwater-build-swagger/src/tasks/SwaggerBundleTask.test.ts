import { IOUtils } from '@codification/cutwater-build-core';
import * as gulp from 'gulp';
import { SwaggerBundleTask } from './SwaggerBundleTask';

const task: SwaggerBundleTask = new SwaggerBundleTask();
task.setConfig({ apiFile: './test/swagger.yaml', outfile: './temp/compiled.yaml', type: 'yaml' });

test('the swagger file is bundled', done => {
  task.executeTask(gulp).then(result => {
    expect(result).toBeTruthy();
    expect(IOUtils.fileExists('./temp/compiled.yaml')).toBeTruthy();
    done();
  });
});
