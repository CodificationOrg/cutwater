import { BuildConfig, getConfig, IOUtils } from '@codification/cutwater-build-core';
import * as path from 'path';
import * as TerserPlugin from 'terser-webpack-plugin';
import * as Webpack from 'webpack';

const buildConfig: BuildConfig = getConfig();
const packageJSON: { name: string } = IOUtils.readJSONSyncSafe('./package.json');

const webpackConfiguration = (env, options): Webpack.Configuration => {
  const isProduction: boolean = options.mode === 'production';

  const minimizer: any[] = [];
  if (isProduction) {
    minimizer.push(
      new TerserPlugin({
        parallel: true,
        include: /\.min\.js$/,
        terserOptions: {
          ecma: 2020,
        },
      }),
    );
  }

  return {
    mode: isProduction ? 'production' : 'development',
    context: __dirname,
    devtool: isProduction ? undefined : 'inline-source-map',

    entry: {
      [packageJSON.name]: path.join(__dirname, buildConfig.srcFolder, 'index.ts'),
    },

    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },

    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
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
      minimizer,
    },
  };
};

module.exports = webpackConfiguration;
