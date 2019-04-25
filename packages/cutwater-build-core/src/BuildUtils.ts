export class BuildUtils {
  public static toSimplePackageName(packageName: string): string {
    let rval: string = packageName;
    const sepIndex: number = packageName.indexOf('/');
    if (sepIndex !== -1 && packageName.indexOf('@') === 0) {
      rval = packageName.substring(sepIndex + 1);
    }
    return rval;
  }
}