const path = require('path');

const SRC_DIR = path.resolve(__dirname, 'src');
const ENTRY = path.resolve(SRC_DIR, 'index.ts');
const OUT_DIR = path.resolve(__dirname, '_bundles');

const TerserPlugin = require('terser-webpack-plugin');

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
        umdNamedDefine: true,
        globalObject: "(typeof window !== 'undefined' ? window : this)",
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    devtool: 'source-map',
    optimization: {
        minimizer: [
            new TerserPlugin({
                parallel: true,
                sourceMap: true,
                include: /\.min\.js$/,
                terserOptions: {
                    ecma: 6,
                },
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