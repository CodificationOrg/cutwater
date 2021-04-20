export interface ItemDescriptor<T> {
  getId(item: T): string;
  getParentId(item: T): string | undefined;
}
