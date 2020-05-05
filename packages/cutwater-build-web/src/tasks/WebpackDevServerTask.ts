import { BuildConfig, GulpTask } from '@codification/cutwater-build-core';
import { WebpackResources, WebpackTaskConfig, WebpackUtils } from '@codification/cutwater-build-webpack';
import { Gulp } from 'gulp';
import * as Webpack from 'webpack';
import * as Server from 'webpack-dev-server/lib/Server';

export class WebpackDevServerTask<TExtendedConfig = {}> extends GulpTask<WebpackTaskConfig & TExtendedConfig> {
  private readonly EXIT_IMMEDIATELY_FLAG: string = 'exitImmediately';
  private readonly DEV_SERVER_CONFIG: string = 'devServer';
  private wpResources: WebpackResources;

  constructor(extendedConfig?: TExtendedConfig) {
    super('webpack-dev-server', {
      configPath: './webpack.config.js',
      suppressWarnings: [],
      printStats: true,
      ...((extendedConfig as unknown) as object),
    } as any);
  }

  public get resources(): WebpackResources {
    if (!this.wpResources) {
      this.wpResources = {
        webpack: this.config.webpack || Webpack,
      };
    }

    return this.wpResources;
  }

  public isEnabled(buildConfig: BuildConfig): boolean {
    return super.isEnabled(buildConfig) && this.config.configPath !== null;
  }

  public executeTask(localGulp: Gulp, completeCallback: (error?: string) => void): void {
    let webpackConfig: object | undefined;

    try {
      webpackConfig = WebpackUtils.loadConfig(this.config);
      if (!webpackConfig) {
        this.logMissingConfigWarning();
        completeCallback();
        return;
      }
    } catch (err) {
      completeCallback(`Error parsing webpack config[${this.config.configPath}]: ${err}`);
      return;
    }

    if (webpackConfig) {
      const webpack: typeof Webpack = this.config.webpack || Webpack;

      let compiler: Webpack.Compiler;
      try {
        this.log('Creating Webpack compiler...');
        compiler = webpack(webpackConfig);
        this.log('Compiler created.');
      } catch (err) {
        completeCallback(`Error creating Webpack compiler[${this.config.configPath}]: ${err}`);
        return;
      }

      let server: Server;
      try {
        this.log('Starting Webpack dev server...');
        const options: any = webpackConfig[this.DEV_SERVER_CONFIG] || {};
        server = new Server(compiler, options);
        if (!!this.config[this.EXIT_IMMEDIATELY_FLAG]) {
          server.close(() => {
            completeCallback();
            return;
          });
        }
      } catch (err) {
        completeCallback(`Error creating Webpack DevServer[${this.config.configPath}]: ${err}`);
        return;
      }
      ['SIGINT', 'SIGTERM'].forEach((signal: any) => {
        process.on(signal, () => {
          server.close(() => {
            completeCallback();
            return;
          });
        });
      });
    }
  }

  private logMissingConfigWarning(): void {
    // tslint:disable-next-line:no-console
    console.warn(
      'No webpack config has been provided. ' +
        'Run again using --initwebpack to create a default config, ' +
        `or call webpack.setConfig({ configPath: null }) in your gulpfile.`,
    );
  }
}
