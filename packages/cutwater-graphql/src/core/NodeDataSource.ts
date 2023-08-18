import { Node, NodeSource } from '../types';
import { NodeId } from './NodeId';

export class NodeDataSource {
  public constructor(private readonly SOURCES: NodeSource<Node>[]) {}

  public isSource(nodeIdOrNodeType: NodeId | string): boolean {
    const nodeType = typeof nodeIdOrNodeType === 'string' ? nodeIdOrNodeType : nodeIdOrNodeType.nodeType;
    return !!this.findNodeService(nodeType);
  }

  public async resolve<T extends Node>(id: NodeId): Promise<T | undefined> {
    const source = this.findNodeService(id.nodeType);
    return source ? ((await source.resolve(id)) as T) : undefined;
  }

  public async resolveConnections<T extends Node>(connectionType: string, parentId?: NodeId): Promise<T[]> {
    const source = this.findNodeService(connectionType);
    return source ? ((await source.resolveConnections(parentId)) as T[]) : [];
  }

  private findNodeService(nodeType: string): NodeSource<Node> | undefined {
    return this.SOURCES.find((source) => source.isSource(nodeType));
  }
}
