import { IOUtils } from '@codification/cutwater-build-core';
import { WebpackTaskConfig } from '../tasks/WebpackTask';

export class WebpackUtils {
  public static loadConfig(config: WebpackTaskConfig): object | undefined {
    let rval: object | undefined;
    if (config.configPath && IOUtils.fileExists(config.configPath)) {
      try {
        rval = require(IOUtils.resolvePath(config.configPath));
      } catch (err) {
        throw new Error(`Error parsing webpack config: ${config.configPath}: ${err}`);
      }
    } else if (config.config) {
      rval = config.config;
    }
    return rval;
  }
}
