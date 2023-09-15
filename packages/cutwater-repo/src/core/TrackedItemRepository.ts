import { OutputTracker } from '@codification/cutwater-nullable';
import { EventEmitter } from 'node:events';

import { ItemRepository } from '../types';

export interface MethodCallData {
  method: string;
  args?: unknown[];
}

export class TrackedItemRepository<T> implements ItemRepository<T> {
  private readonly emiiter = new EventEmitter();

  public static create<T>(repo: ItemRepository<T>): TrackedItemRepository<T> {
    return new TrackedItemRepository<T>(repo);
  }

  public constructor(private readonly repo: ItemRepository<T>) {}

  public get itemType(): string {
    return this.repo.itemType;
  }

  public trackMethodCalls(): OutputTracker<MethodCallData> {
    return OutputTracker.create<MethodCallData>(this.emiiter);
  }

  private recordMethodCall(method: string, ...args: unknown[]): void {
    this.emiiter.emit(
      OutputTracker.DEFAULT_EVENT,
      JSON.stringify({ method, args })
    );
  }

  public getAll(parentId?: string): Promise<T[]> {
    this.recordMethodCall('getAll', parentId);
    return this.repo.getAll(parentId);
  }

  public get(id: string): Promise<T | undefined> {
    this.recordMethodCall('get', id);
    return this.repo.get(id);
  }

  public put(item: T): Promise<T> {
    this.recordMethodCall('put', item);
    return this.repo.put(item);
  }

  public putAll(items: T[]): Promise<T[]> {
    this.recordMethodCall('putAll', items);
    return this.repo.putAll(items);
  }

  public remove(id: string): Promise<T | undefined> {
    this.recordMethodCall('remove', id);
    return this.repo.remove(id);
  }

  public async removeAll(ids: string[]): Promise<string[]> {
    this.recordMethodCall('removeAll', ids);
    return this.repo.removeAll(ids);
  }
}
