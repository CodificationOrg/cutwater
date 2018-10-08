/**
 * A singleton to provide easy access to mutable configuration values.
 */
export class Config {

  /**
   * Sets the specified configuration key to the provided value.
   * 
   * @param key - The configuration key.
   * @param value - The configuration value.
   * @returns The previous value of the key if one existed.
   */
  public static put(key: string, value: string): string {
    const rval = this.get(key);
    this.config[key] = value;
    return rval;
  }

  /**
   * Returns the the configuration value for the provided key.  Values have the following precedence: internal Config cache, environment variables, the specified default value.
   * If no value is found and no default is provided, an empty string will be returned.
   * 
   * @param key - The configuration key.
   * @param defaultValue - The value to be returned if one is not found in the internal cache or environment variables.
   * @returns The configuration value associated with the key.
   */
  public static get(key: string, defaultValue: string = ''): string {
    let rval = this.config[key] ? this.config[key] : process.env[key];
    if (!rval) {
      rval = defaultValue;
    }
    return rval;
  }

  /**
   * Returns the configuration value following the same precedence as the 'get' method.  However, if a value is not found, an error will be thrown, optionally using the provided message.
   * 
   * @param key - The configuration key.
   * @param errorMsg - The error message to be used if there is no value for the key.
   * @returns The configuration value associated with the key.
   */
  public static getRequired(key: string, errorMsg?: string): string {
    const rval = Config.get(key);
    if (!rval) {
      throw new Error(errorMsg ? errorMsg : `Required config value [${key}] is missing.`);
    }
    return rval;
  }

  private static config: { [key: string]: string } = {};
}
