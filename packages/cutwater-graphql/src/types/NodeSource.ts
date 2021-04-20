import { NodeId } from '../core';
import { Node } from './Node';

export interface NodeSource<T extends Node> {
  isSource(nodeIdOrNodeType: NodeId | string): boolean;
  resolve(id: NodeId): Promise<(T & Node) | undefined>;
  resolveConnections(parentId?: NodeId): Promise<(T & Node)[]>;
}
