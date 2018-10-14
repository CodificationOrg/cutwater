import { Config } from './Config';

/**
 * Utility for simple detection of the current execution environment.
 */
export class Env {
  /**
   * Name of the [[Config]] variable expected to contain the name of the environment.
   *
   * @readonly
   */

  public static readonly ENV_STAGE: string = 'STAGE';
  /**
   * Name of the [[Config]] variable expected to contain an override of the default production environment name.
   *
   * @readonly
   */

  public static readonly ENV_PROD_STAGE: string = 'PROD_STAGE';
  /**
   * Default value for the `STAGE` variable in [[Config]] to indicate a production environment.
   *
   * @readonly
   */

  public static readonly DEFAULT_PROD_STAGE: string = 'prod';

  /**
   * Returns `true` if the `STAGE` value in [[Config]] indicates a production environment.
   *
   * @returns {boolean}
   */
  public static isProd(): boolean {
    return Config.get(Env.ENV_STAGE) === Config.get(Env.ENV_PROD_STAGE, Env.DEFAULT_PROD_STAGE);
  }

  /**
   * Returns `true` if the `STAGE` value in [[Config]] does not indicate a production environment. In other words: `!Env.isProd()`.
   *
   * @returns {boolean}
   */
  public static isDev(): boolean {
    return !this.isProd();
  }
}
