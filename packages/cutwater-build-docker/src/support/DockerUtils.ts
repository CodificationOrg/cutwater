import { BuildConfig, IOUtils } from '@codification/cutwater-build-core';
import { isAbsolute, join } from 'path';

export class DockerUtils {
  public static toContextFolderPath(contextFolder: string, buildConfig?: BuildConfig): string {
    if (isAbsolute(contextFolder)) {
      return contextFolder;
    } else if (buildConfig) {
      const { tempFolder } = buildConfig;
      return IOUtils.resolvePath(join(tempFolder, contextFolder), buildConfig);
    }
    throw new Error('contextFolder is relative, but no BuildConfig was provided.');
  }
}
