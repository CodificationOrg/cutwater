import { NodeId } from '../core';
import { Node } from './Node';

export interface NodeSource<T extends Node> {
  isSource(nodeIdOrNodeType: NodeId | string): boolean;
  resolve(nodeId: NodeId): Promise<(T & Node) | undefined>;
  resolveConnections(parentNodeId?: NodeId): Promise<(T & Node)[]>;
}
