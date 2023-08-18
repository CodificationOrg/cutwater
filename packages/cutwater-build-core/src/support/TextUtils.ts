export class TextUtils {
  public static convertPropertyNameToArg(configName: string): string {
    return `--${this.convertCamelCaseToKebabCase(configName)}`;
  }

  public static convertCamelCaseToKebabCase(value: string): string {
    return value
      .replace(/\W+/g, '-')
      .replace(/([a-z\d])([A-Z])/g, '$1-$2')
      .toLowerCase();
  }

  public static combineToMultilineText(value: string[], trailingLF = false): string {
    return value.reduce<string>((rval, line, index) => {
      return `${rval}${line}${index < value.length - 1 || trailingLF ? '\n' : ''}`;
    }, '');
  }
}
