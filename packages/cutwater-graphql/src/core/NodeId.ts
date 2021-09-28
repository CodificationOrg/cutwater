export class NodeId {
  public static readonly SEPARATOR = ':';
  private static readonly TYPE = 0;
  private static readonly OBJECT_ID = 1;

  public readonly id: string;
  public readonly clearId: string;

  public static create(nodeType: string, objectId: string): NodeId {
    return new NodeId(nodeType, objectId);
  }

  public static from(nodeId: string): NodeId {
    const nodeType = NodeId.getNodeIdPart(nodeId, NodeId.TYPE);
    const objectId = NodeId.getNodeIdPart(nodeId, NodeId.OBJECT_ID);
    if (!nodeType || !objectId) {
      throw new Error(`Value is not a valid NodeId: ${nodeId}`);
    }
    return new NodeId(nodeType, objectId);
  }

  public static isEncodedNodeId(id: string): boolean {
    return id.match(/^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/) !== null;
  }

  public setNodeType(nodeType: string): NodeId {
    return NodeId.create(nodeType, this.objectId);
  }

  public setObjectId(objectId: string): NodeId {
    return NodeId.create(this.nodeType, objectId);
  }

  private static encodeNodeId(id: string): string {
    if (NodeId.isEncodedNodeId(id)) {
      return id;
    }
    return Buffer.from(id, 'utf8').toString('base64');
  }

  private static decodeNodeId(id: string): string {
    let rval = id;
    if (NodeId.isEncodedNodeId(id)) {
      rval = Buffer.from(id, 'base64').toString('utf8');
    }
    return rval;
  }

  private static getNodeIdPart(id: string, partIndex: number): string | undefined {
    const rval = NodeId.decodeNodeId(id).split(NodeId.SEPARATOR);
    if (rval.length < 2) {
      return undefined;
    } else if (partIndex === NodeId.TYPE) {
      return rval[NodeId.TYPE];
    }
    return rval.slice(1).join(this.SEPARATOR);
  }

  private constructor(public readonly nodeType: string, public readonly objectId: string) {
    this.clearId = `${nodeType}${NodeId.SEPARATOR}${objectId}`;
    this.id = NodeId.encodeNodeId(this.clearId);
  }
}
