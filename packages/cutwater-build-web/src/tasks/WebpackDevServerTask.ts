import { WebpackTask, WebpackTaskConfig } from '@codification/cutwater-build-webpack';

export class WebpackDevServerTask extends WebpackTask<WebpackTaskConfig> {
  constructor() {
    super();
    this.name = 'webpack-dev-server';
  }

  protected prepareOptions(): string {
    return `serve ${super.prepareOptions()}`;
  }
}
