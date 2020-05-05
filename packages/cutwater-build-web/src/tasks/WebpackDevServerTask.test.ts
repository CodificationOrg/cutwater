import { initialize, setConfig } from '@codification/cutwater-build-core';
import { WebpackTaskConfig } from '@codification/cutwater-build-webpack';
import * as gulp from 'gulp';
import { WebpackDevServerTask } from './WebpackDevServerTask';

beforeAll(() => {
  initialize(gulp);
});

const config: any = {
  mode: 'development',
  watch: false,
  devServer: {
    port: 9000,
    compress: true,
    open: true,
    publicPath: 'dist',
    lazy: true,
    liveReload: false,
    hot: false,
    watchContentBase: false,
  },
};

describe('WebpackDevServerTask', () => {
  it('can create a webpack dev server', done => {
    const task = new WebpackDevServerTask();
    setConfig({
      verbose: true,
    });
    task.setConfig({
      config,
      exitImmediately: true,
    } as Partial<WebpackTaskConfig>);
    task.executeTask(gulp, err => {
      done();
    });
  });
});
