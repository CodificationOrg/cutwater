export interface ItemRepository<T> {
  readonly itemType: string;
  getAll(parentId?: string): Promise<T[]>;
  get(id: string): Promise<T | undefined>;
  put(item: T): Promise<T>;
  putAll(item: T[]): Promise<T[]>;
  remove(id: string): Promise<T | undefined>;
  removeAll(ids: string[]): Promise<string[]>;
}
