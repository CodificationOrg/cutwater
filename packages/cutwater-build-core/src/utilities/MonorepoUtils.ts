import { existsSync, lstatSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import { PackageJSON } from '../State';
import { IOUtils } from './IOUtils';

export class MonorepoUtils {
  private static readonly PACKAGE_JSON = 'package.json';
  private static readonly WILDCARD_SUFFIX = '/*';

  public static isRepoRoot(path: string): boolean {
    const packagePath = resolve(join(path, MonorepoUtils.PACKAGE_JSON));
    let rval: PackageJSON | undefined;
    if (existsSync(packagePath)) {
      rval = IOUtils.readObjectFromFileSync<PackageJSON>(packagePath);
    }
    return rval !== undefined && rval.workspaces !== undefined;
  }

  public static findRepoRootPath(startingPath = resolve(process.cwd())): string | undefined {
    if (MonorepoUtils.isRepoRoot(startingPath)) {
      return startingPath;
    }
    const nextPath = resolve(startingPath, '..');
    if (nextPath.length < startingPath.length) {
      return MonorepoUtils.findRepoRootPath(nextPath);
    }
    return undefined;
  }

  public static loadRepoRootPackageJSON(startingPath?: string): PackageJSON | undefined {
    const rootPath = MonorepoUtils.findRepoRootPath(startingPath);
    if (rootPath) {
      const packagePath = resolve(join(rootPath, MonorepoUtils.PACKAGE_JSON));
      return IOUtils.readObjectFromFileSync<PackageJSON>(packagePath);
    }
    return undefined;
  }

  public static findRepoWorkspacePaths(pkgObj: PackageJSON): string[] {
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

  private static expandWorkspacePath(basePath: string, wsPath: string): string[] {
    if (wsPath.endsWith(MonorepoUtils.WILDCARD_SUFFIX)) {
      const dir = resolve(basePath, wsPath.substring(0, wsPath.length - MonorepoUtils.WILDCARD_SUFFIX.length));
      return readdirSync(dir)
        .map((fn) => resolve(join(dir, fn)))
        .filter((p) => lstatSync(p).isDirectory());
    } else {
      return [wsPath];
    }
  }

  public static findRepoModules(startingPath?: string): Record<string, string> {
    const rval = {};
    const rootPath = MonorepoUtils.findRepoRootPath(startingPath);
    const pkgObj = MonorepoUtils.loadRepoRootPackageJSON(rootPath);
    if (rootPath && pkgObj) {
      const wsPaths = MonorepoUtils.findRepoWorkspacePaths(pkgObj).reduce<string[]>((rval, wsPath) => {
        rval.push(...MonorepoUtils.expandWorkspacePath(rootPath, wsPath));
        return rval;
      }, []);
      wsPaths.forEach((wsPath) => {
        const wsPkg = IOUtils.readJSONSync<PackageJSON>(resolve(wsPath, MonorepoUtils.PACKAGE_JSON));
        if (wsPkg && wsPkg.name) {
          rval[wsPkg.name] = wsPath;
        }
      });
    }
    return rval;
  }
}
