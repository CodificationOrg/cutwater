import { VALUE_SEPERATOR } from '@codification/cutwater-aws';
import { NodeId } from '../../core';

export class CompoundKey {
  public static readonly SEPARATOR = VALUE_SEPERATOR;

  private readonly nodeType: string;
  private readonly parts: string[];

  private constructor(nodeType: string, itemId: string) {
    this.parts = itemId.split(NodeId.SEPARATOR);
    this.nodeType = nodeType;
  }

  public static fromNodeId(nodeId: NodeId): CompoundKey {
    return new CompoundKey(nodeId.nodeType, nodeId.objectId);
  }

  public static fromItemId(nodeType: string, itemId: string): CompoundKey {
    return new CompoundKey(nodeType, itemId);
  }

  public static fromKey(partitionValue: string, sortValue: string): CompoundKey {
    const sortParts = sortValue.split(CompoundKey.SEPARATOR);
    const nodeType = sortParts.shift();
    const parts = [...partitionValue.split(CompoundKey.SEPARATOR), sortParts.pop()!];
    return new CompoundKey(nodeType!, parts.join(NodeId.SEPARATOR));
  }

  public get partitionValue(): string {
    return this.parts.slice(0, -1).join(CompoundKey.SEPARATOR);
  }

  public get sortKeyValue(): string {
    return `${this.nodeType}${CompoundKey.SEPARATOR}${this.parts.slice(-1)}`;
  }

  public get nodeId(): NodeId {
    return NodeId.create(this.nodeType, this.parts.join(NodeId.SEPARATOR));
  }

  public get itemId(): string {
    return this.parts.join(NodeId.SEPARATOR);
  }

  public get parentItemId(): string {
    return this.parts.slice(0, -1).join(NodeId.SEPARATOR);
  }
}
