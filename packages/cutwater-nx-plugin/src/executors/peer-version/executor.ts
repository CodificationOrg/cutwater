import {
  ExecutorContext,
  logger,
  readJsonFile,
  writeJsonFile,
} from '@nx/devkit';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { WorkspaceMetadata } from '../../support';
import { PeerVersionOptions } from './Schema';

const updateOutputDependencies = (
  projectName: string,
  version: string,
  workspace: WorkspaceMetadata
): void => {
  const peerDeps = workspace.findWorkspacePeerDependencies(projectName, '*');
  const outputRoot = workspace.findOutputRoot(projectName);
  const pkgPath = outputRoot ? resolve(outputRoot, 'package.json') : undefined;

  if (peerDeps.length > 0 && pkgPath && existsSync(pkgPath)) {
    let count = 0;
    logger.info(`Updating workspace peer dependencies for: ${projectName}`);
    const pkgObj = readJsonFile(pkgPath);
    peerDeps.forEach((dep) => {
      if (pkgObj.dependencies[dep]) {
        count++;
        pkgObj.dependencies[dep] = version;
      }
    });
    writeJsonFile(pkgPath, pkgObj);
    logger.info(`Updated ${count} dependencies: ${pkgPath}`);
  }
};

const runExecutor = async (
  options: PeerVersionOptions,
  context: ExecutorContext
) => {
  const workspace = new WorkspaceMetadata(context);
  const version = workspace.findVersion();
  const projectsToUpdate: string[] = workspace.isWorkspaceTask()
    ? workspace.projectNames
    : [context.projectName];

  projectsToUpdate.forEach((project) =>
    updateOutputDependencies(project, version, workspace)
  );

  return {
    success: true,
  };
};

export default runExecutor;
