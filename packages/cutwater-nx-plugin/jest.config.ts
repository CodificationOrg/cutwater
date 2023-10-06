import * as dotenv from 'dotenv';
dotenv.config();

/* eslint-disable */
export default {
  displayName: `${process.env['NX_TASK_TARGET_PROJECT']}`,
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: `packages/${process.env['NX_TASK_TARGET_PROJECT']}`,
};
