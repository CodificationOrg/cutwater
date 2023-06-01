import { GulpTask, IOUtils, PACKAGE_JSON } from '@codification/cutwater-build-core';
import { PackageJSON } from '@codification/cutwater-build-core/lib/State';
import { cpSync, existsSync } from 'fs';
import { copyFile } from 'fs/promises';
import { basename, join, resolve } from 'path';
import { DOCKER_CONTEXT_FOLDER } from '../Constants';
import { DockerUtils } from '../support/DockerUtils';

export interface PrepareImageContextTaskConfig {
  includes?: string[];
  contextFolder: string;
}

export class PrepareImageContextTask<
  T extends PrepareImageContextTaskConfig = PrepareImageContextTaskConfig
> extends GulpTask<T, void> {
  private static readonly DIRECTORY_WILDCARD = '/*';
  private static readonly ROOT_PACKAGE_JSON = 'root-package.json';

  public constructor(name = 'prepare-image-context', defaultConfig: Partial<T> = {}) {
    super(name, {
      contextFolder: DOCKER_CONTEXT_FOLDER,
      ...defaultConfig,
    });
  }

  private async copyLockFile(): Promise<void> {
    if (this.buildConfig.lockFile) {
      const basePath = this.buildConfig.repoMetadata ? this.buildConfig.repoMetadata.rootPath : process.cwd();
      copyFile(
        resolve(basePath, this.buildConfig.lockFile),
        resolve(this.contextFolderPath, this.buildConfig.lockFile),
      );
    }
  }

  private copyAssets(srcDir: string, dstDir: string, includes: string[]): void {
    includes.forEach(item => {
      const isFolder = item.endsWith(PrepareImageContextTask.DIRECTORY_WILDCARD);
      const itemName = isFolder
        ? item.substring(0, item.length - PrepareImageContextTask.DIRECTORY_WILDCARD.length)
        : item;
      const srcAsset = join(srcDir, itemName);
      const dstAsset = join(dstDir, itemName);
      if (existsSync(srcAsset)) {
        if (isFolder) {
          IOUtils.mkdirs(dstAsset);
        }
        cpSync(srcAsset, dstAsset, { recursive: isFolder });
      }
    });
  }

  private cleanPackage(pkgPath: string): void {
    const pkg = IOUtils.readJSONSyncSafe<PackageJSON>(pkgPath);
    delete pkg.devDependencies;
    delete pkg.optionalDependencies;
    IOUtils.writeObjectToFileSync(pkg, pkgPath);
  }

  private copyPackage(srcDir: string, dstDir: string): void {
    IOUtils.mkdirs(dstDir);
    const includes = this.config.includes || [PACKAGE_JSON, `${this.buildConfig.libFolder}/*`];
    this.copyAssets(srcDir, dstDir, includes);
    this.cleanPackage(join(dstDir, PACKAGE_JSON));
  }

  public get contextFolderPath(): string {
    return DockerUtils.toContextFolderPath(this.config.contextFolder, this.buildConfig);
  }

  public async executeTask(): Promise<void> {
    const { rootPath, repoMetadata } = this.buildConfig;

    IOUtils.mkdirs(this.contextFolderPath);
    await this.copyLockFile();

    if (repoMetadata) {
      const currentPackage = IOUtils.readJSONSyncSafe<PackageJSON>(PACKAGE_JSON, this.buildConfig);
      if (!currentPackage.name) {
        throw new Error('Package is missing the "name" property in the package.json file.');
      }
      const pkgsFolder = join(this.contextFolderPath, 'packages');
      this.copyPackage(rootPath, join(pkgsFolder, 'app'));
      repoMetadata.findAllDependentPackageNames(currentPackage.name).forEach(depName => {
        const srcDir = repoMetadata.getPackagePath(depName);
        const dstDir = join(pkgsFolder, basename(srcDir));
        this.copyPackage(srcDir, dstDir);
      });

      const imgRootPkg = IOUtils.readJSONSyncSafe<PackageJSON>(
        resolve(__dirname, PrepareImageContextTask.ROOT_PACKAGE_JSON),
      );
      imgRootPkg.resolutions = repoMetadata.rootPackageJSON.resolutions;
      IOUtils.writeObjectToFileSync(imgRootPkg, join(this.contextFolderPath, PACKAGE_JSON));
    } else {
      this.copyPackage(rootPath, this.contextFolderPath);
    }
  }
}
