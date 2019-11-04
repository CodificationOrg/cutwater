import { IOUtils } from '@codification/cutwater-build-core';
import * as path from 'path';
import * as TerserPlugin from 'terser-webpack-plugin';
import * as Webpack from 'webpack';
import * as wpBuild from '../';
import { WebpackTask } from './WebpackTask';

const webpackTask: WebpackTask = wpBuild.webpack;

const isProduction: boolean = webpackTask.buildConfig.production;

const packageJSON: { name: string } = IOUtils.readJSONSyncSafe('./package.json');

const webpackConfiguration: Webpack.Configuration = {
  mode: isProduction ? 'production' : 'development',
  context: __dirname,
  devtool: isProduction ? undefined : 'source-map',

  entry: {
    [packageJSON.name]: path.join(__dirname, webpackTask.buildConfig.libFolder, 'index.js'),
  },

  output: {
    libraryTarget: 'umd',
    path: path.join(__dirname, webpackTask.buildConfig.distFolder),
    filename: `[name]${isProduction ? '.min' : ''}.js`,
  },

  externals: {
    react: {
      amd: 'react',
      commonjs: 'react',
    },
    'react-dom': {
      amd: 'react-dom',
      commonjs: 'react-dom',
    },
  } as any,

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
