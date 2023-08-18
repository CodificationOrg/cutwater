import { SpawnOptions } from '@codification/cutwater-build-node';

export interface CliConfig<O, P> {
  options?: O;
  parameters?: P;
  args?: string[];
  spawnOptions: SpawnOptions;
}
