import * as gulp from 'gulp';

import { SwaggerValidateTask } from './SwaggerValidateTask';

const task: SwaggerValidateTask = new SwaggerValidateTask();
task.setConfig({ apiFile: './test/swagger.yaml' });

test('the swagger file is validated', done => {
  task.executeTask(gulp).then(api => {
    expect(api).toBeTruthy();
    done();
  });
});
