import { PackageJSON } from './PackageJSON';

export interface BuildState {
  readonly root: string;
  readonly args: Record<string, string | boolean>;
  readonly builtPackage: PackageJSON;
  readonly toolPackage: PackageJSON;
  readonly nodeVersion: string;
  getFlagValue(name: string, defaultValue?: boolean): boolean;
  getConfigValue(name: string, defaultValue?: string | boolean): string | boolean | undefined;
}
