import * as gulp from 'gulp';
import { initialize } from '..';
import { RunCommandTask, RunCommandTaskConfig } from './RunCommandTask';

initialize(gulp);

test('can run echo', done => {
  const task: RunCommandTask<RunCommandTaskConfig> = new RunCommandTask();
  task.setConfig({ command: 'echo', args: '"Hello World!"' });
  task
    .executeTask(gulp)
    .then(() => {
      expect(true).toBeTruthy();
      done();
    })
    .catch(err => done(err));
});
