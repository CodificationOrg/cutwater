"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const path = require("path");
const webpackTask = require('@microsoft/web-library-build').webpack;
const uglifyJsPlugin = require('uglifyjs-webpack-plugin');
const isProduction = webpackTask.buildConfig.production;
const webpackConfiguration = {
    context: __dirname,
    devtool: (isProduction) ? undefined : 'source-map',
    entry: {
        'cutwater-aws': path.join(__dirname, webpackTask.buildConfig.libFolder, 'index.js')
    },
    output: {
        libraryTarget: 'umd',
        path: path.join(__dirname, webpackTask.buildConfig.distFolder),
        filename: `[name]${isProduction ? '.min' : ''}.js`
    },
    externals: {
        'aws-sdk': 'aws-sdk'
    }
};
if (isProduction && webpackConfiguration.plugins) {
    webpackConfiguration.plugins.push(new uglifyJsPlugin({
        uglifyOptions: {
            mangle: true,
            compress: {
                dead_code: true,
                warnings: false
            }
        }
    }));
}
module.exports = webpackConfiguration;
//# sourceMappingURL=webpack.config.js.map