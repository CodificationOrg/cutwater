import * as gulp from 'gulp';

import { CloudFormationPackageTask } from './CloudFormationPackageTask';

test('it properly fails with invalid arguments', done => {
  const task: CloudFormationPackageTask = new CloudFormationPackageTask();
  task.setConfig({ quiet: true });
  task
    .executeTask(gulp)
    .then(() => {
      done.fail(new Error('should have thrown error'));
    })
    .catch(err => {
      expect(err).toBeTruthy();
      done();
    });
});
