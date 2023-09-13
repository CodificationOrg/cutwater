export class ObjectUtils {
  public static findProperty(
    obj: Record<string, unknown>,
    propName: string
  ): unknown | undefined {
    if (propName.indexOf('.') === -1) {
      return obj[propName];
    } else {
      let rval: unknown | undefined = obj;
      let index = 0;
      const props = propName.split('.');
      while (rval && index < props.length) {
        rval = this.findProperty(rval as Record<string, unknown>, props[index]);
        index++;
      }
      return rval;
    }
  }
}
