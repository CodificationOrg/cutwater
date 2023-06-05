import { BuildContext } from '../core/BuildContext';
import { BuildConfig } from './BuildConfig';

export interface ExecutableTask<T> {
  maxBuildTimeMs?: number;
  onRegister?: () => void;
  execute: (context: BuildContext) => Promise<void>;
  name?: string;
  isEnabled?: (buildConfig: BuildConfig) => boolean;
  getCleanMatch?: (config: BuildConfig, taskConfig?: T) => string[];
}
