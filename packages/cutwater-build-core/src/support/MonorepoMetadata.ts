import { existsSync, lstatSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import { PACKAGE_JSON } from '../Constants';
import { PackageJSON } from '../State';
import { IOUtils } from './IOUtils';

export class MonorepoMetadata {
  private static readonly WILDCARD_SUFFIX = '/*';

  public static isRepoRoot(path: string): boolean {
    const packagePath = resolve(join(path, PACKAGE_JSON));
    let rval: PackageJSON | undefined;
    if (existsSync(packagePath)) {
      rval = IOUtils.readObjectFromFileSync<PackageJSON>(packagePath);
    }
    return rval !== undefined && rval.workspaces !== undefined;
  }

  public static findRepoRootPath(basePath = resolve(process.cwd())): string | undefined {
    if (MonorepoMetadata.isRepoRoot(basePath)) {
      return basePath;
    }
    const nextPath = resolve(basePath, '..');
    if (nextPath.length < basePath.length) {
      return MonorepoMetadata.findRepoRootPath(nextPath);
    }
    return undefined;
  }

  public static create(basePath = resolve(process.cwd())): MonorepoMetadata {
    const repoRootPath = MonorepoMetadata.findRepoRootPath(basePath);
    if (!repoRootPath) {
      throw new Error(`Could not find monorepo root from base path: ${basePath}`);
    }
    return new MonorepoMetadata(repoRootPath);
  }

  public readonly rootPackageJSON: PackageJSON;
  private readonly repoPackages: Record<string, string>;

  public get packageNames(): string[] {
    return Object.keys(this.repoPackages);
  }

  public getPackagePath(packageName: string): string {
    return this.repoPackages[packageName];
  }

  public getPackageJSON(packageName: string): PackageJSON {
    const pkgPath = resolve(join(this.getPackagePath(packageName), PACKAGE_JSON));
    return IOUtils.readObjectFromFileSyncSafe<PackageJSON>(pkgPath);
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

  private constructor(public readonly rootPath: string) {
    const packagePath = resolve(join(rootPath, PACKAGE_JSON));
    this.rootPackageJSON = IOUtils.readObjectFromFileSyncSafe<PackageJSON>(packagePath);
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
      return readdirSync(dir)
        .map((fn) => resolve(join(dir, fn)))
        .filter((p) => lstatSync(p).isDirectory());
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
        const wsPkg = IOUtils.readJSONSync<PackageJSON>(resolve(wsPath, PACKAGE_JSON));
        if (wsPkg && wsPkg.name) {
          rval[wsPkg.name] = wsPath;
        }
      });
    }
    return rval;
  }
}
