export class Config {
  public static put(key: string, value: string): string {
    const rval = this.get(key);
    this.config[key] = value;
    return rval;
  }

  public static get(key: string, defaultValue: string = ''): string {
    let rval = this.config[key] ? this.config[key] : process.env[key];
    if (!rval) {
      rval = defaultValue;
    }
    return rval;
  }

  public static getRequired(key: string, errorMsg?: string): string {
    const rval = Config.get(key);
    if (!rval) {
      throw new Error(errorMsg ? errorMsg : `Required config value [${key}] is missing.`);
    }
    return rval;
  }

  private static config: { [key: string]: string } = {};
}
