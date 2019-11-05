import { VarUtils } from './VarUtils';

/**
 * Utility for handling common string related tasks.
 * @beta
 */
export class StringUtils {
  /**
   * Returns `true` if the value is a string containing only whitespace or is empty.
   *
   * @param value - the string to be checked
   * @returns true if the value is blank
   */
  public static isBlank(value: string = ''): boolean {
    return StringUtils.isEmpty(value) || value.trim().length === 0;
  }

  /**
   * Returns `true` if the value is a string is empty.
   *
   * @param value - the string to be checked
   * @returns true if the string is empty
   */
  public static isEmpty(value: string = ''): boolean {
    return value.length < 1;
  }

  /**
   * Returns `true` if the `value` contains the `searchTerm`. By default, this function is case sensitive.
   *
   * @param value - the value to be searched
   * @param searchTerm - the value to be searched for
   * @param caseInsensitive - true if the match should be case sensitive
   * @returns true if the value contains the search term
   */
  public static contains(value: string, searchTerm: string, caseInsensitive: boolean = false): boolean {
    return (
      VarUtils.isPresent(value) &&
      VarUtils.isPresent(searchTerm) &&
      (value.indexOf(searchTerm) !== -1 ||
        (caseInsensitive && value.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1))
    );
  }

  /**
   * Returns `true` if the `value` starts with the `searchTerm`. By default, this function is case sensitive.
   *
   * @param value - the value to be searched
   * @param searchTerm - the prefix to be searched for
   * @param caseInsensitive - true if the match should be case sensitive
   * @returns true if the value starts with the search term
   */
  public static startsWith(value: string, searchTerm: string, caseInsensitive: boolean = false): boolean {
    return (
      VarUtils.isPresent(value) &&
      VarUtils.isPresent(searchTerm) &&
      (value.indexOf(searchTerm) === 0 ||
        (caseInsensitive && value.toLowerCase().indexOf(searchTerm.toLowerCase()) === 0))
    );
  }

  /**
   * Returns `true` if the `value` ends with the `searchTerm`. By default, this function is case sensitive.
   *
   * @param value - the value to be searched
   * @param searchTerm - the suffix to be searched for
   * @param caseInsensitive - true if the match should be case sensitive
   * @returns true if the value ends with the search term
   */
  public static endsWith(value: string, searchTerm: string, caseInsensitive: boolean = false): boolean {
    const index: number =
      value && searchTerm && value.length >= searchTerm.length ? value.length - searchTerm.length : -1;
    return (
      index !== -1 &&
      (value.indexOf(searchTerm) === index ||
        (caseInsensitive && value.toLowerCase().indexOf(searchTerm.toLowerCase()) === index))
    );
  }
}
