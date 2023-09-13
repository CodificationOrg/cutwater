import { ItemDescriptor } from '../types';

export class ItemPropertyDescriptor<T> implements ItemDescriptor<T> {
  public constructor(
    private readonly itemType: string,
    private readonly idProperty: string,
    private readonly parentIdProperty?: string
  ) {}

  public getId(item: T): string {
    return item[this.idProperty as keyof T] as string;
  }

  public getType(): string {
    return this.itemType;
  }

  public getParentId(item: T): string | undefined {
    return this.parentIdProperty
      ? (item[this.parentIdProperty as keyof T] as string)
      : undefined;
  }
}
