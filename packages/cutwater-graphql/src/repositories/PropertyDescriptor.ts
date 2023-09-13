import { ItemDescriptor } from '@codification/cutwater-repo';
import { NodeId } from '../core';
import { NodeItemDescriptor } from './NodeItemDescriptor';

export class PropertyDescriptor<T extends object>
  implements ItemDescriptor<T>, NodeItemDescriptor<T>
{
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

  public getItemId(nodeId: NodeId): string {
    return nodeId.objectId;
  }

  public getItemParentId(nodeId?: NodeId): string | undefined {
    return nodeId?.objectId;
  }

  public getObjectId(item: T): string {
    return this.getId(item);
  }

  public getParentObjectId(item: T): string | undefined {
    return this.getParentId(item);
  }
}
