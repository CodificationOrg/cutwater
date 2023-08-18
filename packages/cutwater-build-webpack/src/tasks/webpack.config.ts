import { BuildConfig, buildEngine } from '@codification/cutwater-build-core';
import { join } from 'path';
import TerserPlugin from 'terser-webpack-plugin';
import Webpack from 'webpack';

const buildConfig: BuildConfig = buildEngine.getConfig();
const packageJSON: { name: string } = buildEngine.system.toFileReference('package.json').readObjectSyncSafe();

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
      [packageJSON.name]: join(__dirname, buildConfig.srcFolder, 'index.ts'),
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
      path: join(__dirname, buildConfig.distFolder),
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
