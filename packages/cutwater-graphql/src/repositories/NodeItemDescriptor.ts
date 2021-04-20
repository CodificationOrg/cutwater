import { NodeId } from '../core';

export interface NodeItemDescriptor<T> {
  getItemId(nodeId: NodeId): string;
  getItemParentId(nodeId?: NodeId): string | undefined;
  getObjectId(item: T): string;
  getParentObjectId(item: T): string | undefined;
}
