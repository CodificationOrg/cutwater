import { existsSync, lstatSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import { PackageJSON } from '../State';
import { IOUtils } from './IOUtils';

export class MonorepoMetadata {
  private static readonly PACKAGE_JSON = 'package.json';
  private static readonly WILDCARD_SUFFIX = '/*';

  public static isRepoRoot(path: string): boolean {
    const packagePath = resolve(join(path, MonorepoMetadata.PACKAGE_JSON));
    let rval: PackageJSON | undefined;
    if (existsSync(packagePath)) {
      rval = IOUtils.readObjectFromFileSync<PackageJSON>(packagePath);
    }
    return rval !== undefined && rval.workspaces !== undefined;
  }

  public static findRepoRootPath(basePath: string): string | undefined {
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
  private readonly repoModules: Record<string, string>;

  public get moduleNames(): string[] {
    return Object.keys(this.repoModules);
  }

  public getModulePath(moduleName: string): string {
    return this.repoModules[moduleName];
  }

  public getPackageJSON(moduleName: string): PackageJSON {
    const pkgPath = resolve(join(this.getModulePath(moduleName), MonorepoMetadata.PACKAGE_JSON));
    return IOUtils.readObjectFromFileSyncSafe<PackageJSON>(pkgPath);
  }

  private addModuleDependencies(moduleName: string, deps: string[] = []): string[] {
    const modulePkg = this.getPackageJSON(moduleName);
    if (modulePkg.dependencies) {
      Object.keys(modulePkg.dependencies)
        .filter((dep) => !deps.includes(dep) && this.moduleNames.includes(dep))
        .forEach((dep) => {
          deps.push(dep);
          this.addModuleDependencies(dep, deps);
        });
    }
    return deps;
  }

  public findAllDependentModuleNames(moduleName: string): string[] {
    return this.addModuleDependencies(moduleName);
  }

  private constructor(public readonly rootPath: string) {
    const packagePath = resolve(join(rootPath, MonorepoMetadata.PACKAGE_JSON));
    this.rootPackageJSON = IOUtils.readObjectFromFileSyncSafe<PackageJSON>(packagePath);
    this.repoModules = this.initRepoModules();
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

  private initRepoModules(): Record<string, string> {
    const rval = {};
    if (this.rootPath && this.rootPackageJSON) {
      const wsPaths = this.findRepoWorkspacePaths(this.rootPackageJSON).reduce<string[]>((rval, wsPath) => {
        rval.push(...this.expandWorkspacePath(this.rootPath, wsPath));
        return rval;
      }, []);
      wsPaths.forEach((wsPath) => {
        const wsPkg = IOUtils.readJSONSync<PackageJSON>(resolve(wsPath, MonorepoMetadata.PACKAGE_JSON));
        if (wsPkg && wsPkg.name) {
          rval[wsPkg.name] = wsPath;
        }
      });
    }
    return rval;
  }
}
