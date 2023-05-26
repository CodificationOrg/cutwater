import { GulpTask, IOUtils, MonorepoMetadata } from '@codification/cutwater-build-core';
import { PackageJSON } from '@codification/cutwater-build-core/lib/State';
import { cpSync, existsSync } from 'fs';
import { copyFile } from 'fs/promises';
import { basename, join, resolve } from 'path';

export interface PrepareImageAssetsTaskConfig {
  dockerFile: string;
  lockFile: string;
  includeDirs: string[];
  includeFiles: string[];
  tempAssetDirectory: string;
}

export class PrepareImageAssetsTask<T extends PrepareImageAssetsTaskConfig = PrepareImageAssetsTaskConfig> extends GulpTask<
  T,
  void
> {
  public static readonly DOCKERFILE = 'Dockerfile';
  public static readonly PACKAGE_JSON = 'package.json';
  private static readonly ROOT_PACKAGE_JSON = 'root-package.json';

  public constructor(name = 'prepare-image-assets', defaultConfig: Partial<T> = {}) {
    super(name, {
      dockerFile: PrepareImageAssetsTask.DOCKERFILE,
      lockFile: 'yarn.lock',
      includeDirs: ['lib'],
      includeFiles: [PrepareImageAssetsTask.PACKAGE_JSON],
      tempAssetDirectory: 'docker',
      ...defaultConfig,
    } as T);
  }

  private async copyCoreFiles(): Promise<void> {
    const rval = [copyFile(IOUtils.resolvePath(this.config.dockerFile, this.buildConfig), this.dockerFile)];
    const basePath = MonorepoMetadata.findRepoRootPath(process.cwd()) || process.cwd();
    rval.push(copyFile(resolve(basePath, this.config.lockFile), resolve(this.dockerFolder, this.config.lockFile)));
    await Promise.all(rval);
  }

  private cleanPackage(pkgPath: string): void {
    const pkg = IOUtils.readJSONSyncSafe<PackageJSON>(pkgPath);
    delete pkg.devDependencies;
    IOUtils.writeObjectToFileSync(pkg, pkgPath);
  }

  private copyModule(srcDir: string, dstDir: string): void {
    IOUtils.mkdirs(dstDir);
    this.copyAssets(srcDir, dstDir, this.config.includeDirs);
    this.copyAssets(srcDir, dstDir, this.config.includeFiles, false);
    this.cleanPackage(join(dstDir, PrepareImageAssetsTask.PACKAGE_JSON));
  }

  private copyAssets(srcDir: string, dstDir: string, includes: string[], createDst = true): void {
    includes.forEach((item) => {
      const srcAsset = join(srcDir, item);
      const dstAsset = join(dstDir, item);
      if (existsSync(srcAsset)) {
        if (createDst) {
          IOUtils.mkdirs(dstAsset);
        }
        cpSync(srcAsset, dstAsset, { recursive: createDst });
      }
    });
  }

  public get dockerFolder(): string {
    const { tempFolder } = this.buildConfig;
    const { tempAssetDirectory } = this.config;
    return IOUtils.resolvePath(join(tempFolder, tempAssetDirectory), this.buildConfig);
  }

  public get dockerFile(): string {
    return join(this.dockerFolder, PrepareImageAssetsTask.DOCKERFILE);
  }

  public async executeTask(): Promise<void> {
    const { rootPath } = this.buildConfig;

    IOUtils.mkdirs(this.dockerFolder);
    await this.copyCoreFiles();

    try {
      const monorepo = MonorepoMetadata.create();
      const currentModule = IOUtils.readJSONSyncSafe<PackageJSON>(
        PrepareImageAssetsTask.PACKAGE_JSON,
        this.buildConfig,
      );
      if (!currentModule.name) {
        throw new Error('Module is missing the "name" property in the package.json file.');
      }
      const pkgsFolder = join(this.dockerFolder, 'packages');
      this.copyModule(rootPath, join(pkgsFolder, 'app'));
      monorepo.findAllDependentModuleNames(currentModule.name).forEach((depName) => {
        const srcDir = monorepo.getModulePath(depName);
        const dstDir = join(pkgsFolder, basename(srcDir));
        this.copyModule(srcDir, dstDir);
      });

      const imgRootPkg = IOUtils.readJSONSyncSafe<PackageJSON>(
        resolve(__dirname, PrepareImageAssetsTask.ROOT_PACKAGE_JSON),
      );
      imgRootPkg.resolutions = monorepo.rootPackageJSON.resolutions;
      IOUtils.writeObjectToFileSync(imgRootPkg, join(this.dockerFolder, PrepareImageAssetsTask.PACKAGE_JSON));
    } catch (err) {
      this.copyModule(rootPath, this.dockerFolder);
    }
  }
}
