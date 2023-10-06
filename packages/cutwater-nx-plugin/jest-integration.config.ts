/* eslint-disable */
import base from './jest.config';
export default {
  ...base,
  displayName: `${process.env['NX_TASK_TARGET_PROJECT']}-integration`,
  testMatch: ['<rootDir>/src/**/*.(integ).(ts|js)?(x)'],
};
