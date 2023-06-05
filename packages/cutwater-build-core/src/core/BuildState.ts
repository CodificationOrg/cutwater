import { join, resolve } from 'path';
import yargs from 'yargs';
import { PACKAGE_JSON } from './Constants';
import { IOUtils } from '../support/IOUtils';
import { PackageJSON } from '../types';

export interface BuildState {
  readonly root: string;
  readonly args: Record<string, string | boolean>;
  readonly builtPackage: PackageJSON;
  readonly toolPackage: PackageJSON;
  readonly nodeVersion: string;
  getFlagValue(name: string, defaultValue?: boolean): boolean;
  getConfigValue(name: string, defaultValue?: string | boolean): string | boolean | undefined;
}

export const getBuildState = (): BuildState => {
  return BuildStateImpl.instance;
};

class BuildStateImpl implements BuildState {
  public readonly root: string = process.cwd();
  public readonly args = yargs.argv as Record<string, string | boolean>;
  public readonly builtPackage: PackageJSON;
  public readonly toolPackage: PackageJSON = IOUtils.readObjectFromFileSyncSafe<PackageJSON>(
    resolve(__dirname, '..', PACKAGE_JSON),
  );
  public readonly nodeVersion: string = process.version;

  private readonly packageJson: PackageJSON;

  public static readonly instance: BuildState = new BuildStateImpl();

  private static readonly ENVIRONMENT_VARIABLE_PREFIX = 'CCB_';

  public getConfigValue(name: string, defaultValue?: string | boolean): string | boolean | undefined {
    const envVariable: string = BuildStateImpl.ENVIRONMENT_VARIABLE_PREFIX + name.toUpperCase();
    const envValue: string | undefined = process.env[envVariable];
    const argsValue: string | boolean | undefined =
      this.args[name.toLowerCase()] === undefined
        ? undefined
        : typeof this.args[name.toLowerCase()] === 'boolean'
        ? (this.args[name.toLowerCase()] as boolean)
        : `${this.args[name.toLowerCase()]}`;

    return this.firstValue(argsValue, envValue, defaultValue);
  }

  public getFlagValue(name: string, defaultValue?: boolean): boolean {
    const configValue: string | boolean | undefined = this.getConfigValue(name, defaultValue);
    return configValue === 'true' || configValue === true;
  }

  private firstValue(...values: Array<string | boolean | undefined>): string | boolean | undefined {
    for (const value of values) {
      if (value !== undefined) {
        return value;
      }
    }
    return undefined;
  }

  private loadPackageJson(): PackageJSON {
    let rval: PackageJSON = {
      directories: {
        packagePath: undefined,
      },
    };
    try {
      rval = IOUtils.readJSONSyncSafe<PackageJSON>(join(process.cwd(), PACKAGE_JSON));
    } catch (e) {
      // Package.json probably doesn't exit
    }
    return rval;
  }

  private constructor() {
    this.packageJson = this.loadPackageJson();
    this.builtPackage = this.packageJson;
  }
}
