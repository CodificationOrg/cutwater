import { BuildConfig } from './BuildConfig';
import { BuildContext } from './BuildContext';

export interface ExecutableTask<T> {
  maxBuildTimeMs?: number;
  onRegister?: () => void;
  execute: (context: BuildContext) => Promise<void>;
  name?: string;
  isEnabled?: (buildConfig: BuildConfig) => boolean;
  getCleanMatch?: (config: BuildConfig, taskConfig?: T) => string[];
}
