import { Gulp } from 'gulp';
import { BuildConfig } from './BuildConfig';

export type CustomGulpTask = (
  gulp: Gulp,
  buildConfig: BuildConfig,
  done?: (failure?: string | Error) => void,
) => Promise<unknown> | NodeJS.ReadWriteStream | void;
