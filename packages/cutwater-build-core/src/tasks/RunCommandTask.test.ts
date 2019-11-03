import * as gulp from 'gulp';

import { RunCommandTask, RunCommandTaskConfig } from './RunCommandTask';

test('can run echo', done => {
  const task: RunCommandTask<RunCommandTaskConfig> = new RunCommandTask();
  task.setConfig({ command: 'echo "Hello World!"' });
  task
    .executeTask(gulp)
    .then(() => {
      expect(true).toBeTruthy();
      done();
    })
    .catch(err => done(err));
});
