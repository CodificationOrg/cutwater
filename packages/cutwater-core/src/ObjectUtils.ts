export class ObjectUtils {
  public static findProperty(
    obj: unknown,
    propName: string
  ): unknown | undefined {
    if (obj && typeof obj === 'object') {
      if (propName.indexOf('.') === -1) {
        return propName in obj
          ? (obj as Record<string, unknown>)[propName]
          : undefined;
      } else {
        let rval: unknown | undefined = obj;
        let index = 0;
        const props = propName.split('.');
        while (rval && index < props.length) {
          rval = this.findProperty(rval, props[index]);
          index++;
        }
        return rval;
      }
    }
    return undefined;
  }
}
