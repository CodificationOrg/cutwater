import { WebpackTask } from '@codification/cutwater-build-webpack';

export class WebpackDevServerTask extends WebpackTask {
  constructor() {
    super();
    this.name = 'webpack-dev-server';
  }

  protected prepareOptions(): string {
    return `serve ${super.prepareOptions()}`;
  }
}
