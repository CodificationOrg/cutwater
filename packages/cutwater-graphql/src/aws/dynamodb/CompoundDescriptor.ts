import { ItemDescriptor, NodeId, NodeItemDescriptor } from '../..';
import { CompoundKey } from './CompoundKey';

export class CompoundDescriptor<T> implements ItemDescriptor<T>, NodeItemDescriptor<T> {
  public constructor(private readonly nodeType, private readonly idProperty: string) {}

  public getId(item: T): string {
    return item[this.idProperty];
  }

  public getParentId(item: T): string {
    return CompoundKey.fromItemId(this.nodeType, this.getId(item)).parentItemId;
  }

  public getItemId(nodeId: NodeId): string {
    return nodeId.objectId;
  }

  public getItemParentId(nodeId: NodeId): string {
    return CompoundKey.fromNodeId(nodeId).itemId;
  }

  public getObjectId(item: T): string {
    return this.getId(item);
  }

  public getParentObjectId(item: T): string {
    return this.getParentId(item);
  }
}
