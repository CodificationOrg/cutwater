'use strict';

module.exports = {
  collectCoverageFrom: [
    './packages/*/src/**/*.{js,jsx}',
    './packages/*/src/**/*.{ts,tsx}'
  ],
  projects: ['<rootDir>/packages/*/'],
  testPathIgnorePatterns: [
    '/node_modules/',
  ]
};