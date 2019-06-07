'use strict';

const build = require('@microsoft/node-library-build');
const cutwater = require('@codification/cutwater-build-core');

cutwater.registerCiTasks(require('./package.json'));

build.initialize(require('gulp'));
