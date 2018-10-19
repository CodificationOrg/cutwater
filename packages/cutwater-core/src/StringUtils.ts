export class StringUtils {
  /**
   * Returns `true` if the `value` contains the `searchTerm`. By default, this function is case sensitive.
   *
   * @param value - The value to be searched.
   * @param searchTerm - The value to be searched for.
   * @param caseInsensitive - Value indicating if the match should be case sensitive.
   * @return {boolean}
   */
  public static contains(value: string, searchTerm: string, caseInsensitive = false): boolean {
    return (
      value &&
      searchTerm &&
      (value.indexOf(searchTerm) !== -1 || (caseInsensitive && value.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1))
    );
  }

  /**
   * Returns `true` if the `value` starts with the `searchTerm`. By default, this function is case sensitive.
   *
   * @param value - The value to be searched.
   * @param searchTerm - The prefix to be searched for.
   * @param caseInsensitive - Value indicating if the match should be case sensitive.
   * @return {boolean}
   */
  public static startsWith(value: string, searchTerm: string, caseInsensitive = false): boolean {
    return (
      value &&
      searchTerm &&
      (value.indexOf(searchTerm) === 0 || (caseInsensitive && value.toLowerCase().indexOf(searchTerm.toLowerCase()) === 0))
    );
  }

  /**
   * Returns `true` if the `value` ends with the `searchTerm`. By default, this function is case sensitive.
   *
   * @param value - The value to be searched.
   * @param searchTerm - The suffix to be searched for.
   * @param caseInsensitive - Value indicating if the match should be case sensitive.
   * @return {boolean}
   */
  public static endsWith(value: string, searchTerm: string, caseInsensitive = false): boolean {
    const index = value && searchTerm && value.length >= searchTerm.length ? value.length - searchTerm.length : -1;
    return (
      index !== -1 &&
      (value.indexOf(searchTerm) === index ||
        (caseInsensitive && value.toLowerCase().indexOf(searchTerm.toLowerCase()) === index))
    );
  }
}
