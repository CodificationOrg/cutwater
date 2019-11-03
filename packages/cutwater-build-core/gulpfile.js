'use strict';

const del = require('del');

const clean = () => {
    return del(['lib']);
}
exports.clean = clean;