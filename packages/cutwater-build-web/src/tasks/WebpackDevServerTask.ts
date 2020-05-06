import { BuildConfig, GulpTask } from '@codification/cutwater-build-core';
import { WebpackResources, WebpackTaskConfig, WebpackUtils } from '@codification/cutwater-build-webpack';
import * as fs from 'fs';
import { Gulp } from 'gulp';
import * as net from 'net';
import * as Webpack from 'webpack';
import * as Server from 'webpack-dev-server/lib/Server';
import * as createLogger from 'webpack-dev-server/lib/utils/createLogger';
import * as processOptions from 'webpack-dev-server/lib/utils/processOptions';

export class WebpackDevServerTask<TExtendedConfig = {}> extends GulpTask<WebpackTaskConfig & TExtendedConfig> {
  private readonly EXIT_IMMEDIATELY_FLAG: string = 'exitImmediately';
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
      let server: Server;

      ['SIGINT', 'SIGTERM'].forEach((signal: any) => {
        process.on(signal, () => {
          this.log('Received signal, stopping Webpack dev server.');
          server.close(() => {
            completeCallback();
            return;
          });
        });
      });

      processOptions(webpackConfig, {}, (config, options) => {
        this.logVerbose(`Config: \n${JSON.stringify(config)}`);
        this.logVerbose(`Options: \n${JSON.stringify(options)}`);
        const webpack: typeof Webpack = this.config.webpack || Webpack;

        let compiler: Webpack.Compiler;

        try {
          this.logVerbose('Creating Webpack compiler...');
          compiler = webpack(config);
          this.logVerbose('Compiler created.');
        } catch (err) {
          completeCallback(`Error creating Webpack compiler[${this.config.configPath}]: ${err}`);
          return;
        }

        const log = createLogger({ logLevel: this.logger().isVerboseEnabled() ? 'debug' : 'info' });

        try {
          this.log('Starting Webpack dev server...');
          server = new Server(compiler, options, log);
          this.log('Webpack dev server is running.');
        } catch (err) {
          completeCallback(`Error creating Webpack dev server[${this.config.configPath}]: ${err}`);
          return;
        }

        if (options.socket) {
          server.listeningApp.on('error', (e: any) => {
            if (e.code === 'EADDRINUSE') {
              const clientSocket = new net.Socket();

              clientSocket.on('error', (err: any) => {
                if (err.code === 'ECONNREFUSED') {
                  fs.unlinkSync(options.socket);

                  server.listen(options.socket, options.host, error => {
                    if (error) {
                      completeCallback(`Webpack dev server error: ${error}`);
                      return;
                    }
                  });
                }
              });

              clientSocket.connect({ path: options.socket }, () => {
                completeCallback(`This socket is already used...`);
                return;
              });
            }
          });

          server.listen(options.socket, options.host, err => {
            if (err) {
              completeCallback(`Webpack dev server error: ${err}`);
              return;
            }

            const READ_WRITE = 438;
            fs.chmod(options.socket, READ_WRITE, (error: any) => {
              if (err) {
                completeCallback(`Webpack dev server error: ${error}`);
                return;
              }
            });
          });
        } else {
          server.listen(options.port, options.host, err => {
            if (err) {
              completeCallback(`Webpack dev server error: ${err}`);
              return;
            }
          });
        }

        if (!!this.config[this.EXIT_IMMEDIATELY_FLAG]) {
          this.log('Stopping Webpack dev server... Now!');
          server.close(() => {
            completeCallback();
            return;
          });
        }
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
