/**
 * A singleton to provide easy access to mutable configuration values.
 * @beta
 */
export class Config {
  /**
   * This will set the provided configuration `key` to the specified `value`. This does not make any changes to
   * `process.env`, the key/value pair is stored in memory only.
   *
   * @param key - the configuration key
   * @param value - the configuration value
   * @returns the previous configuration value if one existed
   */
  public static put(key: string, value: string): string {
    const rval: string = this.get(key);
    this.config[key] = value;
    return rval;
  }

  /**
   * Returns the value associated with the `key`, checking first for values provided by the [[Config.put]] method and
   * then from `process.env`.
   * If the value is not found, the `defaultValue` is returned, or an empty string if that is not provided.
   *
   * @param key - the configuration key
   * @param defaultValue - the value to be returned if one is not found in the internal cache or environment variables
   */
  public static get(key: string, defaultValue: string = ''): string {
    let rval: string | undefined = this.config[key] ? this.config[key] : process.env[key];
    if (!rval) {
      rval = defaultValue;
    }
    return rval;
  }

  /**
   * Returns the value associated with the `key`, checking first for values provided by the [[Config.put]] method and
   * then from `process.env`.
   * Unlike the [[Config.get]] method, an error is thrown if the value is not found, using the message specified if
   * provided.
   *
   * @param key - the configuration key
   * @param errorMsg - the error message to be used if there is no value for the key
   */
  public static getRequired(key: string, errorMsg?: string): string {
    const rval: string | undefined = Config.get(key);
    if (!rval) {
      throw new Error(errorMsg ? errorMsg : `Required config value [${key}] is missing.`);
    }
    return rval;
  }

  private static config: { [key: string]: string } = {};
}
