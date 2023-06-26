import { join, resolve } from 'path';

import { System } from '@codification/cutwater-nullable';
import { PACKAGE_JSON } from '../core/Constants';
import { PackageJSON } from '../types/PackageJSON';

export class MonorepoMetadata {
  private static readonly WILDCARD_SUFFIX = '/*';

  public static create(basePath?: string): MonorepoMetadata | undefined {
    try {
      return new MonorepoMetadata(System.create(), basePath);
    } catch (err) {
      return undefined;
    }
  }

  public static createNull(
    basePath = resolve('/project/packages'),
    system: System = System.createNull(),
  ): MonorepoMetadata | undefined {
    try {
      return new MonorepoMetadata(system, basePath);
    } catch (err) {
      return undefined;
    }
  }

  public readonly rootPackageJSON: PackageJSON;
  private readonly repoPackages: Record<string, string>;

  public isRepoRoot(path: string): boolean {
    const packagePath = resolve(join(path, PACKAGE_JSON));
    let rval: PackageJSON | undefined;
    const packageFile = this.system.toFileReference(packagePath);
    if (packageFile.exists()) {
      rval = packageFile.readObjectSync<PackageJSON>();
    }
    return rval !== undefined && rval.workspaces !== undefined;
  }

  public findRepoRootPath(basePath: string): string | undefined {
    if (this.isRepoRoot(basePath)) {
      return basePath;
    }
    const nextPath = resolve(basePath, '..');
    if (nextPath.length < basePath.length) {
      return this.findRepoRootPath(nextPath);
    }
    return undefined;
  }

  public get packageNames(): string[] {
    return Object.keys(this.repoPackages);
  }

  public getPackagePath(packageName: string): string {
    return this.repoPackages[packageName];
  }

  public getPackageJSON(packageName: string): PackageJSON {
    const pkgPath = resolve(join(this.getPackagePath(packageName), PACKAGE_JSON));
    return this.system.toFileReference(pkgPath).readObjectSyncSafe<PackageJSON>();
  }

  private addPackageDependencies(packageName: string, deps: string[] = []): string[] {
    const pkgObj = this.getPackageJSON(packageName);
    if (pkgObj.dependencies) {
      Object.keys(pkgObj.dependencies)
        .filter((dep) => !deps.includes(dep) && this.packageNames.includes(dep))
        .forEach((dep) => {
          deps.push(dep);
          this.addPackageDependencies(dep, deps);
        });
    }
    return deps;
  }

  public findAllDependentPackageNames(packageName: string): string[] {
    return this.addPackageDependencies(packageName);
  }

  public readonly rootPath: string;

  private constructor(public readonly system: System, basePath?: string) {
    const repoRootPath = this.findRepoRootPath(basePath || system.cwd());
    if (!repoRootPath) {
      throw new Error(`Could not find monorepo root from base path: ${basePath}`);
    }
    this.rootPath = repoRootPath;
    const packagePath = resolve(join(this.rootPath, PACKAGE_JSON));
    this.rootPackageJSON = system.toFileReference(packagePath).readObjectSyncSafe<PackageJSON>();
    this.repoPackages = this.initRepoPackages();
  }

  private findRepoWorkspacePaths(pkgObj: PackageJSON): string[] {
    const rval: string[] = [];
    if (pkgObj.workspaces) {
      if (!Array.isArray(pkgObj.workspaces)) {
        const wsRecord: Record<string, string[]> = pkgObj.workspaces;
        Object.keys(wsRecord).forEach((wsName) => rval.push(...wsRecord[wsName]));
      } else {
        rval.push(...pkgObj.workspaces);
      }
    }
    return rval;
  }

  private expandWorkspacePath(basePath: string, wsPath: string): string[] {
    if (wsPath.endsWith(MonorepoMetadata.WILDCARD_SUFFIX)) {
      const dir = resolve(basePath, wsPath.substring(0, wsPath.length - MonorepoMetadata.WILDCARD_SUFFIX.length));
      return this.system
        .toFileReference(dir)
        .children()
        .filter((ref) => ref.isDirectory())
        .map((ref) => ref.path);
    } else {
      return [wsPath];
    }
  }

  private initRepoPackages(): Record<string, string> {
    const rval = {};
    if (this.rootPath && this.rootPackageJSON) {
      const wsPaths = this.findRepoWorkspacePaths(this.rootPackageJSON).reduce<string[]>((rval, wsPath) => {
        rval.push(...this.expandWorkspacePath(this.rootPath, wsPath));
        return rval;
      }, []);
      wsPaths.forEach((wsPath) => {
        const wsPkg = this.system.toFileReference(resolve(wsPath, PACKAGE_JSON)).readObjectSync<PackageJSON>();
        if (wsPkg && wsPkg.name) {
          rval[wsPkg.name] = wsPath;
        }
      });
    }
    return rval;
  }
}
