export class TextUtils {
  public static convertPropertyNameToArg(configName: string): string {
    return `--${this.convertCamelCaseToDash(configName)}`;
  }

  public static convertCamelCaseToDash(value: string): string {
    return value
      .replace(/\W+/g, '-')
      .replace(/([a-z\d])([A-Z])/g, '$1-$2')
      .toLowerCase();
  }
}
