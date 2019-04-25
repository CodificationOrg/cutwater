'use strict';

const build = require('@microsoft/web-library-build');
const cutwater = require('@codification/cutwater-build-core');
const packageName = require('./package.json').name;
const path = require('path');

build.tscCmd = 'tsc-commonjs';

const tscAmdTask = new build.TscCmdTask();
tscAmdTask.name = 'tsc-amd';
tscAmdTask.cleanMatch = [path.join(__dirname, 'lib-amd')];
tscAmdTask.setConfig({
  customArgs: ['--outDir', './lib-amd', '--module', 'amd']
});

const tscEsnextTask = new build.TscCmdTask();
tscEsnextTask.name = 'tsc-es6';
tscEsnextTask.cleanMatch = [path.join(__dirname, 'lib-es6')];
tscEsnextTask.setConfig({
  customArgs: ['--outDir', './lib-es6', '--module', 'esnext']
});

cutwater.ciTasks(packageName);

build.defaultTasks = build.task(
  'default',
  build.serial(build.parallel(build.defaultTasks, tscAmdTask, tscEsnextTask), cutwater.mdTypeDoc(packageName, true))
);

build.setConfig({
  libAMDFolder: 'lib-amd',
  libES6Folder: 'lib-es6'
});

build.initialize(require('gulp'));
