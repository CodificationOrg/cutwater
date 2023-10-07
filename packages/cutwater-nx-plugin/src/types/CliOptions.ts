import { SpawnOptions } from '@codification/cutwater-nullable';

export interface CliOptions<O, P> {
  options?: O;
  parameters?: P;
  args?: string[];
  spawnOptions: SpawnOptions;
}
