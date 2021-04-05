export class ObjectUtils {
  public static findProperty(obj: Record<string, any>, propName: string): any | undefined {
    if (propName.indexOf('.') === -1) {
      return obj[propName];
    } else {
      let rval = obj;
      let index = 0;
      const props = propName.split('.');
      while (rval && index < props.length) {
        rval = this.findProperty(rval, props[index]);
        index++;
      }
      return rval;
    }
  }
}
