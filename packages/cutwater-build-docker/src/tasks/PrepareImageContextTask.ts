import { GulpTask, IOUtils, NodeUtils, PACKAGE_JSON } from '@codification/cutwater-build-core';
import { PackageJSON } from '@codification/cutwater-build-core/lib/BuildState';
import { cpSync, existsSync } from 'fs';
import { basename, isAbsolute, join, resolve } from 'path';
import { DOCKERFILE, DOCKER_CONTEXT_FOLDER } from '../Constants';
import { DockerUtils } from '../support/DockerUtils';

export interface ImageConfig {
  name: string;
  dockerfile: string;
}

export interface PrepareImageContextTaskConfig {
  includes?: string[];
  configs?: ImageConfig | ImageConfig[];
  contextFolder: string;
}

export class PrepareImageContextTask<
  T extends PrepareImageContextTaskConfig = PrepareImageContextTaskConfig,
> extends GulpTask<T, void> {
  private static readonly DIRECTORY_WILDCARD = '/*';
  private static readonly ROOT_PACKAGE_JSON = 'root-package.json';

  public constructor(name = 'prepare-image-context', defaultConfig: Partial<T> = {}) {
    super(name, {
      contextFolder: DOCKER_CONTEXT_FOLDER,
      ...defaultConfig,
    });
  }

  protected get contextFolderPath(): string {
    return DockerUtils.toContextFolderPath(this.config.contextFolder, this.buildConfig);
  }

  protected toDockerFilePath(config: ImageConfig): string {
    if (isAbsolute(config.dockerfile)) {
      return config.dockerfile;
    }
    return IOUtils.resolvePath(config.dockerfile, this.buildConfig);
  }

  protected copyDockerfiles(): string[] {
    const configs = NodeUtils.toArray<ImageConfig>(this.config.configs, [
      { name: '', dockerfile: resolve(__dirname, DOCKERFILE) },
    ]);
    return configs.map((config) => {
      const trgName = config.name ? `${DOCKERFILE}.${config.name}` : DOCKERFILE;
      const rval = resolve(this.contextFolderPath, trgName);
      cpSync(this.toDockerFilePath(config), rval);
      return rval;
    });
  }

  private copyLockFile(): void {
    if (this.buildConfig.lockFile) {
      const basePath = this.buildConfig.repoMetadata ? this.buildConfig.repoMetadata.rootPath : process.cwd();
      cpSync(resolve(basePath, this.buildConfig.lockFile), resolve(this.contextFolderPath, this.buildConfig.lockFile));
    }
  }

  private copyAssets(srcDir: string, dstDir: string, includes: string[]): void {
    includes.forEach((item) => {
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

  public async executeTask(): Promise<void> {
    const { rootPath, repoMetadata } = this.buildConfig;

    IOUtils.mkdirs(this.contextFolderPath);
    this.copyDockerfiles();
    this.copyLockFile();

    if (repoMetadata) {
      const currentPackage = IOUtils.readJSONSyncSafe<PackageJSON>(PACKAGE_JSON, this.buildConfig);
      if (!currentPackage.name) {
        throw new Error('Package is missing the "name" property in the package.json file.');
      }
      const pkgsFolder = join(this.contextFolderPath, 'packages');
      this.copyPackage(rootPath, join(pkgsFolder, 'app'));
      repoMetadata.findAllDependentPackageNames(currentPackage.name).forEach((depName) => {
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
