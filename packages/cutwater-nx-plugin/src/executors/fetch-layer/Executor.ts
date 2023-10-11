import { HttpClient, IOUtils } from '@codification/cutwater-node-core';
import { FileReference, Spawn, System } from '@codification/cutwater-nullable';
import { ExecutorContext, cacheDir, logger } from '@nx/devkit';
import { isAbsolute, resolve } from 'path';

import { CliUtils, LoggerAdapter } from '../../support';
import { FetchLayerOptions } from './Schema';

export interface FetchLayerEnv {
  http: HttpClient;
  system: System;
  spawn: Spawn;
}

export default async function runExecutor(
  options: FetchLayerOptions,
  context: ExecutorContext
): Promise<{ success: boolean }> {
  const env: FetchLayerEnv = {
    http: HttpClient.create(),
    system: System.create(),
    spawn: Spawn.create(),
  };
  return fetchLayer(options, context, env);
}

export async function fetchLayer(
  options: FetchLayerOptions,
  context: ExecutorContext,
  env: FetchLayerEnv
): Promise<{ success: boolean }> {
  const layerFile = toLayerFileReference(options, env);
  if (!layerFile.exists()) {
    const url = await toLayerUrl(options, env);
    await env.http.downloadToFile(url, layerFile.path);
    const layerDir = resolve(
      toLayerDirectoryReference(options, context, env).path
    );
    env.system.mkdir(layerDir, true);
    IOUtils.unzip(layerFile.path, layerDir, env.system);
  }
  return {
    success: true,
  };
}

function toAwsCommandArgs(options: Partial<FetchLayerOptions>): string {
  return CliUtils.prepareArgs(
    {
      parameters: {
        ...options,
      },
      spawnOptions: { command: 'aws' },
    },
    { command: 'lambda', subCommand: 'get-layer-version' }
  );
}

async function toLayerUrl(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  { outputPath, ...options }: FetchLayerOptions,
  env: FetchLayerEnv
): Promise<string> {
  const args = toAwsCommandArgs(options);
  logger.info(`Requesting layer url with args: ${args}`);
  return JSON.parse(
    (
      await env.spawn.execute({
        logger: LoggerAdapter.wrap(logger),
        command: 'aws',
        quiet: false,
        ignoreErrors: false,
        cwd: env.system.cwd(),
        args,
      })
    ).toString('utf-8')
  ).Content.Location;
}

function toLayerName(options: FetchLayerOptions): string {
  return `${options.layerName}-${options.versionNumber}`;
}

function toLayerFileReference(
  options: FetchLayerOptions,
  env: FetchLayerEnv
): FileReference {
  return env.system.toFileReference(
    resolve(cacheDir, `${toLayerName(options)}.zip`)
  );
}

function toLayerDirectoryReference(
  options: FetchLayerOptions,
  context: ExecutorContext,
  env: FetchLayerEnv
): FileReference {
  if (isAbsolute(options.outputPath)) {
    return env.system.toFileReference(
      resolve(options.outputPath, `${toLayerName(options)}`)
    );
  }
  return env.system.toFileReference(
    resolve(context.root, options.outputPath, `${toLayerName(options)}`)
  );
}
