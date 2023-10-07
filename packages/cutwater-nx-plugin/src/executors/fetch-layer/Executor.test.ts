import { HttpClient, IOUtils } from '@codification/cutwater-node-core';
import { Spawn, SpawnResponse, System } from '@codification/cutwater-nullable';
import { ExecutorContext } from '@nx/devkit';

import { FetchLayerEnv, fetchLayer } from './Executor';
import { FetchLayerOptions } from './Schema';

const options: FetchLayerOptions = {
  layerName: 'foo',
  versionNumber: 1,
  outputPath: 'dist/layers',
};

const awsResponse: SpawnResponse = {
  output: JSON.stringify({
    Content: {
      Location: 'https://fake-aws.com/layer-download-url',
    },
  }),
};

const system: System = System.createNull();
IOUtils.zip(
  'layer.bin',
  '/layer.zip',
  Buffer.from('Hello world!', 'utf-8'),
  system
);
const raw = system.toFileReference('/layer.zip').readToBuffer();

const env: FetchLayerEnv = {
  http: HttpClient.createNull({ statusCode: 200, raw }, system),
  system,
  spawn: Spawn.createNull(awsResponse, system),
};

const context: ExecutorContext = {
  root: '/workspace',
  cwd: '/workspace/projects/foo',
  isVerbose: true,
};

describe('FetchLayer Executor', () => {
  it('can run', async () => {
    const output = await fetchLayer(options, context, env);
    expect(output.success).toBe(true);
  });
});
