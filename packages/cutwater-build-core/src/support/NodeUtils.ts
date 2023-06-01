export class NodeUtils {
  public static toArray<T>(value?: T | T[]): T[] {
    if (value === undefined || value === null) {
      return [];
    }
    return Array.isArray(value) ? value : [value];
  }
}
