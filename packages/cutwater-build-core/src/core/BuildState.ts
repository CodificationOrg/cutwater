import { join, resolve } from 'path';

import { PackageJSON } from '../types';
import { PACKAGE_JSON } from './Constants';
import { Spawn } from './Spawn';
import { System } from './System';

export interface BuildStateResponses {
  toolVersion?: string;
  gitRevision?: string;
}

export class BuildState {
  private static instance: BuildState;

  public static createNull(responses: BuildStateResponses = {}, system: System = System.createNull()): BuildState {
    const spawnOutput = responses.gitRevision ? { output: responses.gitRevision } : undefined;
    return new BuildState(
      system.args,
      responses.toolVersion || 'nullable',
      system,
      Spawn.createNull(spawnOutput, system),
    );
  }

  public static create(): BuildState {
    if (!BuildState.instance) {
      const system = System.create();
      const toolVersion =
        system.toFileReference(resolve(system.dirname, '..', '..', PACKAGE_JSON)).readObjectSyncSafe<PackageJSON>()
          ?.version || 'unknown';

      BuildState.instance = new BuildState(system.args, toolVersion, system, Spawn.create());
    }
    return BuildState.instance;
  }

  private static readonly CI_BUILD_VARIABLE = 'CI';
  private static readonly BUILD_NUMBER_VARIABLE = 'GITHUB_RUN_NUMBER';
  private static readonly BUILD_ATTEMPT_VARIABLE = 'GITHUB_RUN_ATTEMPT';

  public readonly root: string;
  public readonly nodeVersion: string;
  public readonly builtPackage: PackageJSON;
  private readonly packageJson: PackageJSON;

  private static readonly ENVIRONMENT_VARIABLE_PREFIX = 'CCB_';

  private constructor(
    public readonly args: Record<string, string | boolean>,
    public readonly toolVersion: string,
    public readonly system: System,
    private readonly command: Spawn,
  ) {
    this.root = this.system.cwd();
    this.nodeVersion = this.system.version;
    this.packageJson = this.loadPackageJson();
    this.builtPackage = this.packageJson;
  }

  public isCiBuild(): boolean {
    return !!this.system.env[BuildState.CI_BUILD_VARIABLE];
  }

  public buildNumber(defaultValue: number): number {
    const rval: string | undefined = this.system.env[BuildState.BUILD_NUMBER_VARIABLE];
    return rval ? +rval : defaultValue;
  }

  public attemptNumber(defaultValue: number): number {
    const rval: string | undefined = this.system.env[BuildState.BUILD_ATTEMPT_VARIABLE];
    return rval ? +rval : defaultValue;
  }

  public getConfigValue(name: string, defaultValue?: string | boolean): string | boolean | undefined {
    const envVariable: string = BuildState.ENVIRONMENT_VARIABLE_PREFIX + name.toUpperCase();
    const envValue: string | undefined = this.system.env[envVariable];
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
    const packageFile = this.system.toFileReference(join(this.system.cwd(), PACKAGE_JSON));
    if (packageFile.exists()) {
      return packageFile.readObjectSyncSafe<PackageJSON>();
    }
    return {
      directories: {
        packagePath: undefined,
      },
    };
  }

  public async gitRev(): Promise<string> {
    return (
      await this.command.execute({
        quiet: true,
        command: 'git',
        args: 'rev-parse --verify HEAD',
      })
    )
      .toString()
      .trim();
  }
}
