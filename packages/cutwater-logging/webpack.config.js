"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
// Note: this require may need to be fixed to point to the build that exports the gulp-core-build-webpack instance.
const webpackTask = require('@codification/cutwater-build-webpack').webpack;
const isProduction = webpackTask.buildConfig.production;
const webpackConfiguration = {
    context: __dirname,
    devtool: (isProduction) ? undefined : 'source-map',
    entry: {
        'cutwater-logging': path.join(__dirname, webpackTask.buildConfig.libFolder, 'index.js')
    },
    output: {
        libraryTarget: 'umd',
        path: path.join(__dirname, webpackTask.buildConfig.distFolder),
        filename: `[name]${isProduction ? '.min' : ''}.js`
    },
    devServer: {
        stats: 'none'
    },
    // The typings are missing the "object" option here (https://webpack.js.org/configuration/externals/#object)
    externals: {
        'react': {
            amd: 'react',
            commonjs: 'react'
        },
        'react-dom': {
            amd: 'react-dom',
            commonjs: 'react-dom'
        }
    },
    optimization: {
        minimizer: [],
    },
};
if (isProduction && webpackConfiguration.optimization && webpackConfiguration.optimization.minimizer) {
    webpackConfiguration.optimization.minimizer.push(
        new TerserPlugin({
            parallel: true,
            sourceMap: true,
            include: /\.min\.js$/,
            terserOptions: {
                ecma: 6,
            },
        }),
    );
}
module.exports = webpackConfiguration;
//# sourceMappingURL=webpack.config.js.map