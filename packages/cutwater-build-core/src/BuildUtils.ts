import * as fs from 'fs';
import * as path from 'path';

export class BuildUtils {
  public static toSimplePackageName(packageName: string): string {
    let rval: string = packageName;
    const sepIndex: number = packageName.indexOf('/');
    if (sepIndex !== -1 && packageName.indexOf('@') === 0) {
      rval = packageName.substring(sepIndex + 1);
    }
    return rval;
  }

  public static toPathElements(filePath: string): string[] {
    return path.resolve(filePath).split(path.sep);
  }

  public static toPath(filePath: string[], maxElements?: number): string {
    let elements: string[] = [...filePath];
    if (maxElements && elements.length > maxElements) {
      elements = elements.slice(0, maxElements);
    }
    let rval: string = elements.join(path.sep);
    if (!rval) {
      rval = path.sep;
    }
    return elements.join(path.sep);
  }

  public static createDirectoryPath(dirPath: string): void {
    if (!fs.existsSync(path.resolve(dirPath))) {
      const pathElements: string[] = this.toPathElements(dirPath);
      pathElements.forEach((el, idx) => {
        const curPath: string = this.toPath(pathElements, idx + 1);
        if (!fs.existsSync(curPath)) {
          fs.mkdirSync(curPath);
        }
      });
    }
  }

  public static createFilePath(filePath: string): void {
    this.createDirectoryPath(path.dirname(filePath));
  }
}
