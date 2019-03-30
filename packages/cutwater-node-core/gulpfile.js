'use strict';

const build = require('@microsoft/node-library-build');
const apiDoc = require('@codification/cutwater-build-core');

const apiDocTask = new apiDoc.ApiDocumenterTask();

build.defaultTasks = build.task(
    'default',
    build.serial(
        build.defaultTasks, apiDocTask)
);

build.initialize(require('gulp'));