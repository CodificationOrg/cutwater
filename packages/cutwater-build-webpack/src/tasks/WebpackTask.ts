import { BuildConfig, GulpTask, IOUtils } from '@codification/cutwater-build-core';
import * as colors from 'colors';
import { Gulp } from 'gulp';
import { EOL } from 'os';
import * as path from 'path';
import * as Webpack from 'webpack';

export interface WebpackTaskConfig {
  configPath: string;
  config?: Webpack.Configuration;
  suppressWarnings?: Array<string | RegExp>;
  webpack?: typeof Webpack;
  printStats?: boolean;
}

export interface WebpackResources {
  webpack: typeof Webpack;
}

export class WebpackTask<TExtendedConfig = {}> extends GulpTask<WebpackTaskConfig & TExtendedConfig> {
  private wpResources: WebpackResources;

  constructor(extendedName?: string, extendedConfig?: TExtendedConfig) {
    super(extendedName || 'webpack', {
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
    const shouldInitWebpack: boolean = process.argv.indexOf('--initwebpack') > -1;

    if (shouldInitWebpack) {
      this.log(
        'Initializing a webpack.config.js, which bundles lib/index.js ' + 'into dist/packagename.js into a UMD module.',
      );

      IOUtils.copyFile(path.resolve(__dirname, 'webpack.config.js'));
      completeCallback();
    } else {
      let webpackConfig: object;

      if (this.config.configPath && IOUtils.fileExists(this.config.configPath)) {
        try {
          webpackConfig = require(IOUtils.resolvePath(this.config.configPath));
        } catch (err) {
          completeCallback(`Error parsing webpack config: ${this.config.configPath}: ${err}`);
          return;
        }
      } else if (this.config.config) {
        webpackConfig = this.config.config;
      } else {
        this.logMissingConfigWarning();
        completeCallback();
        return;
      }

      if (webpackConfig) {
        const webpack: typeof Webpack = this.config.webpack || Webpack;
        const startTime = new Date().getTime();
        const outputDir = this.buildConfig.distFolder;

        webpack(webpackConfig, (error, stats) => {
          if (!this.buildConfig.properties) {
            this.buildConfig.properties = {};
          }

          /* tslint:disable:no-string-literal */
          this.buildConfig.properties['webpackStats'] = stats;
          /* tslint:enable:no-string-literal */

          const statsResult = stats.toJson({
            hash: false,
            source: false,
          });

          if (statsResult.errors && statsResult.errors.length) {
            // tslint:disable-next-line:no-console
            console.error(`'${outputDir}':` + EOL + statsResult.errors.join(EOL) + EOL);
          }

          if (statsResult.warnings && statsResult.warnings.length) {
            const unsuppressedWarnings: string[] = [];
            const warningSuppressionRegexes = (this.config.suppressWarnings || []).map((regex: string) => {
              return new RegExp(regex);
            });

            statsResult.warnings.forEach((warning: string) => {
              const suppressed =
                warningSuppressionRegexes.find(suppressionRegex => warning.match(suppressionRegex)) !== undefined;
              if (!suppressed) {
                unsuppressedWarnings.push(warning);
              }
            });

            if (unsuppressedWarnings.length > 0) {
              // tslint:disable-next-line:no-console
              console.warn(`'${outputDir}':` + EOL + unsuppressedWarnings.join(EOL) + EOL);
            }
          }

          const duration = new Date().getTime() - startTime;
          const statsResultChildren = statsResult.children ? statsResult.children : [statsResult];

          statsResultChildren.forEach(child => {
            if (child.chunks) {
              child.chunks.forEach(chunk => {
                if (chunk.files && this.config.printStats) {
                  chunk.files.forEach(file =>
                    // tslint:disable-next-line:no-console
                    console.log(
                      `Bundled: '${colors.cyan(path.basename(file))}', ` +
                        `size: ${colors.magenta('' + chunk.size)} bytes, ` +
                        `took ${colors.magenta(duration.toString(10))} ms.`,
                    ),
                  ); // end file
                }
              }); // end chunk
            }
          }); // end child

          completeCallback();
        }); // endwebpack callback
      }
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
