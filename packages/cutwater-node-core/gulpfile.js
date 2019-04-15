'use strict';

const build = require('@microsoft/node-library-build');
const docs = require('@codification/cutwater-build-core');
const packageName = require('./package.json').name;

build.mocha.enabled = false;
build.defaultTasks = build.task('default', build.serial(build.defaultTasks, docs.mdTypeDoc(packageName, true)));

build.initialize(require('gulp'));
