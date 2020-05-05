import { BuildConfig, getConfig, IOUtils } from '@codification/cutwater-build-core';
import * as path from 'path';
import * as TerserPlugin from 'terser-webpack-plugin';
import * as Webpack from 'webpack';

const buildConfig: BuildConfig = getConfig();
const isProduction: boolean = buildConfig.production;

const packageJSON: { name: string } = IOUtils.readJSONSyncSafe('./package.json');

const webpackConfiguration: Webpack.Configuration = {
  mode: isProduction ? 'production' : 'development',
  context: __dirname,
  devtool: isProduction ? undefined : 'source-map',

  entry: {
    [packageJSON.name]: path.join(__dirname, buildConfig.libFolder, 'index.js'),
  },

  output: {
    libraryTarget: 'umd',
    path: path.join(__dirname, buildConfig.distFolder),
    filename: `[name]${isProduction ? '.min' : ''}.js`,
    globalObject: 'this',
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
