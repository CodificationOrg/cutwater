/**
 * Utility for handling common tasks related to variable validation.
 * @beta
 */
export class VarUtils {
  /**
   * Returns `true` if the value is `undefined` or `null`, otherwise, `false`.
   * Empty or blank strings will return `false`.
   *
   * @param value - the value to be checked
   * @returns true if the value is undefined or null
   */
  public static isMissing(value?: any): boolean {
    return !this.isPresent(value);
  }

  /**
   * Returns `false` if the value is `undefined` or `null`, otherwise, `true`.
   * Empty or blank strings will return `true`.
   *
   * @param value - the value to be checked
   * @returns true if the value is defined and non-null
   */
  public static isPresent(value?: any): boolean {
    return typeof value !== 'undefined' && value !== null;
  }
}
