export interface ItemRepository<T> {
  getAll(parentId?: string): Promise<T[]>;
  get(id: string): Promise<T | undefined>;
  put(item: T): Promise<T>;
  remove(id: string): Promise<T | undefined>;
}
