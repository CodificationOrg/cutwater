import * as path from 'path';
import { argv as clArgs } from 'yargs';
import { getConfig } from './index';
import { IOUtils } from './utilities/IOUtils';

export const root: string = process.cwd();
export const args: { [flat: string]: unknown } = clArgs;

export interface PackageJSON {
  name?: string;
  version?: string;
  directories:
  | {
    packagePath: string | undefined;
  }
  | undefined;
}

let packageJson: PackageJSON = {
  directories: {
    packagePath: undefined,
  },
};
try {
  packageJson = IOUtils.readJSONSyncSafe(path.join(root, 'package.json'));
} catch (e) {
  // Package.json probably doesn't exit
}

export const builtPackage: PackageJSON = packageJson;
export const coreBuildPackage: PackageJSON = require('../package.json');
export const nodeVersion: string = process.version;

const ENVIRONMENT_VARIABLE_PREFIX = 'CCB_';

export const getConfigValue = (name: string, defaultValue?: string | boolean): string | boolean => {
  const envVariable: string = ENVIRONMENT_VARIABLE_PREFIX + name.toUpperCase();
  const envValue: string | undefined = process.env[envVariable];
  const argsValue: string | boolean = (typeof args[name.toLowerCase()] === 'boolean') ?
    args[name.toLowerCase()] as boolean : `${args[name.toLowerCase()]}`;

  const configValue: string | boolean = ((getConfig ? getConfig() : {}) || {})[name];

  return firstValue(argsValue, envValue, defaultValue, configValue);
};

export const getFlagValue = (name: string, defaultValue?: boolean): boolean => {
  const configValue: string | boolean = getConfigValue(name, defaultValue);
  return configValue === 'true' || configValue === true;
};

const firstValue = (...values: Array<string | boolean | undefined>): any => {
  for (const value of values) {
    if (value !== undefined) {
      return value;
    }
  }
  return undefined;
};
