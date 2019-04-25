'use strict';

const build = require('@microsoft/node-library-build');
const cutwater = require('@codification/cutwater-build-core');
const packageName = require('./package.json').name;

cutwater.ciTasks(packageName);

build.defaultTasks = build.task('default', build.serial(build.defaultTasks, cutwater.mdTypeDoc(packageName, true)));

build.initialize(require('gulp'));
