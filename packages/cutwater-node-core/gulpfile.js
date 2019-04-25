'use strict';

const build = require('@microsoft/node-library-build');
const cutwater = require('@codification/cutwater-build-core');
const packageName = require('./package.json').name;

build.mocha.enabled = false;
build.defaultTasks = build.task('default', build.serial(build.defaultTasks, cutwater.mdTypeDoc(packageName, true)));

cutwater.ciTasks(packageName);

build.initialize(require('gulp'));
