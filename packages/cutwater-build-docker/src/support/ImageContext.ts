import { BuildConfig, PACKAGE_JSON, System } from '@codification/cutwater-build-core';
import { FileReference } from '@codification/cutwater-build-core/lib/types/FileReference';
import { PackageJSON } from '@codification/cutwater-build-core/lib/types/PackageJSON';
import { basename, isAbsolute, join, resolve } from 'path/win32';
import { DOCKERFILE } from '../Constants';
import { ImageConfig } from '../types';

const rootPackageJson = {
  name: 'docker-image-root',
  description: 'Docker Image NodeJS Root',
  private: true,
  workspaces: {
    packages: ['packages/*'],
  },
};

const defaultDockerfile = `
FROM node:18.16

COPY package.json yarn.lock ./
COPY packages/ ./packages/

RUN yarn install
`;

export class ImageContext<T extends ImageConfig> {
  private static readonly DIRECTORY_WILDCARD = '/*';

  public readonly contextDirectory: FileReference;

  public constructor(
    contextDirectory: string,
    public readonly imageConfig: T,
    private readonly buildConfig: BuildConfig,
    private readonly system: System = System.create(),
  ) {
    this.contextDirectory = this.toContextDirectoryReference(contextDirectory);
  }

  private toContextDirectoryReference(contextDirectory: string): FileReference {
    if (isAbsolute(contextDirectory)) {
      return this.system.toFileReference(contextDirectory);
    } else {
      const { tempFolder } = this.buildConfig;
      return this.system.toFileReference(join(tempFolder, contextDirectory));
    }
  }

  public get dockerfile(): FileReference {
    const { name } = this.imageConfig;
    return this.system.toFileReference(resolve(this.contextDirectory.path, `${DOCKERFILE}.${name}`));
  }

  private get sourceDockerfile(): FileReference | undefined {
    return this.imageConfig.dockerfile ? this.system.toFileReference(this.imageConfig.dockerfile) : undefined;
  }

  private copyDockerfile(): FileReference {
    const dockerfile = this.dockerfile;
    if (dockerfile.exists()) {
      return dockerfile;
    }
    if (this.sourceDockerfile) {
      return this.sourceDockerfile.copyTo(dockerfile);
    }
    return dockerfile.write(defaultDockerfile);
  }

  private copyLockFile(): void {
    if (this.buildConfig.lockFile) {
      const destLockFile = this.system.toFileReference(resolve(this.contextDirectory.path, this.buildConfig.lockFile));
      if (!destLockFile.exists()) {
        const basePath = this.buildConfig.repoMetadata ? this.buildConfig.repoMetadata.rootPath : this.system.cwd();
        const lockFile = this.system.toFileReference(resolve(basePath, this.buildConfig.lockFile));
        lockFile.copyTo(destLockFile);
      }
    }
  }

  private copyAssets(srcDir: string, dstDir: string, includes: string[]): void {
    includes.forEach(item => {
      const isFolder = item.endsWith(ImageContext.DIRECTORY_WILDCARD);
      const itemName = isFolder ? item.substring(0, item.length - ImageContext.DIRECTORY_WILDCARD.length) : item;
      const srcAsset = this.system.toFileReference(join(srcDir, itemName));
      const dstAsset = this.system.toFileReference(join(dstDir, itemName));
      if (srcAsset.exists()) {
        srcAsset.copyTo(dstAsset);
      }
    });
  }

  private cleanPackage(pkgPath: string): void {
    const pkgFile = this.system.toFileReference(pkgPath);
    const pkg = pkgFile.readObjectSyncSafe<PackageJSON>();
    delete pkg.devDependencies;
    delete pkg.optionalDependencies;
    pkgFile.writeObjectSync(pkg);
  }

  private copyPackage(srcDir: string, dstDir: string, includes: string[]): void {
    this.system.mkdir(dstDir, true);
    this.copyAssets(srcDir, dstDir, includes);
    this.cleanPackage(join(dstDir, PACKAGE_JSON));
  }

  public prepare(includes: string[] = [PACKAGE_JSON, `${this.buildConfig.libFolder}/*`]): void {
    const { rootPath, repoMetadata } = this.buildConfig;

    if (!this.contextDirectory.exists()) {
      this.system.mkdir(this.contextDirectory.path, true);
    }
    this.copyDockerfile();
    this.copyLockFile();

    if (repoMetadata) {
      const currentPackage = this.system.toFileReference(PACKAGE_JSON).readObjectSyncSafe<PackageJSON>();
      if (!currentPackage.name) {
        throw new Error('Package is missing the "name" property in the package.json file.');
      }
      const pkgsDirectory = this.system.toFileReference(join(this.contextDirectory.path, 'packages'));
      this.copyPackage(rootPath, join(pkgsDirectory.path, 'app'), includes);
      repoMetadata.findAllDependentPackageNames(currentPackage.name).forEach(depName => {
        const srcDir = repoMetadata.getPackagePath(depName);
        const dstDir = join(pkgsDirectory.path, basename(srcDir));
        this.copyPackage(srcDir, dstDir, includes);
      });

      const imgRootPkg = (rootPackageJson as unknown) as PackageJSON;
      imgRootPkg.resolutions = repoMetadata.rootPackageJSON.resolutions;
      this.system.toFileReference(resolve(this.contextDirectory.path, PACKAGE_JSON)).writeObjectSync(imgRootPkg);
    } else {
      this.copyPackage(rootPath, this.contextDirectory.path, includes);
    }
  }
}
