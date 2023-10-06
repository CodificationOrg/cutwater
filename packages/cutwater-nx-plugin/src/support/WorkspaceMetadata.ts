import { ObjectUtils } from '@codification/cutwater-core';
import {
  ExecutorContext,
  ProjectGraphProjectNode,
  readJsonFile,
} from '@nx/devkit';
import { existsSync } from 'fs';
import { PackageJson } from 'nx/src/utils/package-json';
import { resolve } from 'path';

export class WorkspaceMetadata {
  private static readonly WORKSPACE_NODE = 'workspace';
  private static readonly PACKAGE_JSON_FILE = 'package.json';

  private readonly nodeNames: string[];
  private readonly nodes: Record<string, ProjectGraphProjectNode>;

  public constructor(private readonly context: ExecutorContext) {
    this.nodes = context.projectGraph?.nodes || {};
    this.nodeNames = Object.keys(this.nodes).filter(
      (name) => name !== WorkspaceMetadata.WORKSPACE_NODE
    );
  }

  public isWorkspaceTask(): boolean {
    return this.context.projectName === WorkspaceMetadata.WORKSPACE_NODE;
  }

  public get projectNames(): string[] {
    return [...this.nodeNames];
  }

  public get canonicalProjectNames(): Record<string, string> {
    return this.nodeNames.reduce<Record<string, string>>(
      (rval, projectName) => {
        const pkgObj = this.readPackageJson(projectName);
        if (pkgObj) {
          rval[projectName] = pkgObj.name;
        }
        return rval;
      },
      {}
    );
  }

  public findCanonicalProjectName(projectName: string): string | undefined {
    return this.canonicalProjectNames[projectName];
  }

  public exists(projectName: string): boolean {
    return this.nodeNames.includes(projectName);
  }

  public findVersion(projectName?: string): string | undefined {
    return this.readPackageJson(projectName)?.version || undefined;
  }

  public getRoot(projectName?: string): string {
    if (!projectName) {
      return resolve(this.context.root);
    }
    if (!this.nodeNames.includes(projectName)) {
      throw new Error(`Unknown package: ${projectName}`);
    }
    return this.nodes[projectName].data.root;
  }

  public findPackageJsonPath(projectName?: string): string | undefined {
    const pkgPath = resolve(
      this.getRoot(projectName),
      WorkspaceMetadata.PACKAGE_JSON_FILE
    );
    return existsSync(pkgPath) ? pkgPath : undefined;
  }

  public readPackageJson(projectName?: string): PackageJson | undefined {
    const pkgPath = this.findPackageJsonPath(projectName);
    return pkgPath ? readJsonFile(pkgPath) : undefined;
  }

  public findOutputRoot(projectName: string): string | undefined {
    return this.findOutputRoots()[projectName];
  }

  public findOutputRoots(): Record<string, string> {
    const root = this.context.root;
    return this.nodeNames.reduce<Record<string, string>>((rval, name) => {
      const { data } = this.nodes[name];
      if (data) {
        const outputPath = ObjectUtils.findProperty(
          data,
          'targets.build.options.outputPath'
        );
        if (outputPath) {
          const fullPath = resolve(root, outputPath as string);
          if (existsSync(fullPath)) {
            rval[name] = fullPath;
          }
        }
      }
      return rval;
    }, {});
  }

  public findWorkspacePeerDependencies(
    projectName: string,
    withVersion?: string
  ): string[] {
    const pkgObj = this.readPackageJson(projectName);
    if (pkgObj && pkgObj.dependencies) {
      const peers = Object.values(this.canonicalProjectNames);
      return Object.keys(pkgObj.dependencies).filter(
        (dep) =>
          peers.includes(dep) &&
          (!withVersion || pkgObj.dependencies[dep] === withVersion)
      );
    }
    return [];
  }
}
