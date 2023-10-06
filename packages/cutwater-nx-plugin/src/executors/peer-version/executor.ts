import { ExecutorContext, readJsonFile } from '@nx/devkit';
import { resolve } from 'path';
import { CutwaterNxPeerVersionExecutorSchema } from './schema';

const runExecutor = async (
  options: CutwaterNxPeerVersionExecutorSchema,
  context: ExecutorContext
) => {
  const { nodes } = context.projectGraph;
  Object.keys(nodes).forEach((name) => {
    const packagePath = resolve(
      context.root,
      nodes[name].data.root,
      'package.json'
    );
    const pkgObj = readJsonFile(packagePath);
    console.log(name, pkgObj['version']);
    return {
      success: true,
    };
  });
};
export default runExecutor;
