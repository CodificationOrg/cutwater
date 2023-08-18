export class NodeUtils {
  public static toArray<T>(value?: T | T[], defaultArray: T[] = []): T[] {
    if (value === undefined || value === null) {
      return defaultArray;
    }
    return Array.isArray(value) ? value : [value];
  }
}
