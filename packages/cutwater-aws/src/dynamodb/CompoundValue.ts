export class CompoundValue {
  public static readonly VALUE_SEPARATOR = '#';

  public static create(...value: Array<string | number | undefined>): CompoundValue {
    if (value.length === 0) {
      return new CompoundValue([]);
    }
    if (value.length === 1 && typeof value[0] === 'string') {
      return new CompoundValue(value[0].split(CompoundValue.VALUE_SEPARATOR));
    }
    return new CompoundValue(
      value.filter(el => el !== undefined).map(el => (typeof el === 'number' ? el.toString() : el)) as string[],
    );
  }

  private constructor(private readonly elements: string[]) {}

  public get parts(): string[] {
    return [...this.elements];
  }

  public getPart(index: number, defaultValue?: string): string | undefined {
    return this.elements.length > index ? this.elements[index] : defaultValue;
  }

  public get value(): string {
    return this.elements.join(CompoundValue.VALUE_SEPARATOR);
  }
}
