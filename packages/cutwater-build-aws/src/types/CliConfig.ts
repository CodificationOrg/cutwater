import { RunCommandConfig } from '@codification/cutwater-build-node';

export interface CliConfig<O, P> {
  options?: O;
  parameters?: P;
  args?: string[];
  runConfig: RunCommandConfig;
}
