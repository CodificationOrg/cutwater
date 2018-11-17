const path = require('path');

const SRC_DIR = path.resolve(__dirname, 'src');
const ENTRY = path.resolve(SRC_DIR, 'index.ts');
const OUT_DIR = path.resolve(__dirname, '_bundles');

const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    entry: {
        'cutwater-core': ENTRY,
        'cutwater-core.min': ENTRY
    },
    output: {
        path: OUT_DIR,
        filename: '[name].js',
        libraryTarget: 'umd',
        library: 'Cutwater-Core',
        umdNamedDefine: true
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    devtool: 'source-map',
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                sourceMap: true,
                include: /\.min\.js$/,
            })
        ]
    },
    module: {
        rules: [{
            test: /\.tsx?$/,
            loader: 'awesome-typescript-loader',
            exclude: /node_modules/,
            query: {
                declaration: false,
            }
        }]
    }
}