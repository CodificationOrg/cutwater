import { initialize } from '@codification/cutwater-build-core';
import * as gulp from 'gulp';
import { CloudFormationPackageTask } from './CloudFormationPackageTask';

beforeAll(() => {
  initialize(gulp);
});

test('it properly fails with invalid arguments', done => {
  const task: CloudFormationPackageTask = new CloudFormationPackageTask();
  task
    .executeTask(gulp)
    .then(result => {
      // tslint:disable-next-line: no-console
      console.log(result);
      expect(false).toBeTruthy();
      done();
    })
    .catch(err => {
      // tslint:disable-next-line: no-console
      console.log(err);
      expect(err).toBeDefined();
      done();
    });
  // return expect(task.executeTask(gulp)).rejects.toBeDefined();
});
