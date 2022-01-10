import { AttributeMap, Key } from 'aws-sdk/clients/dynamodb';
import { DynamoItem, formatValue } from '..';
import { CompoundItemId } from './CompoundItemId';

export class CompoundKey {
  public static readonly DEFAULT_PARENT = 'CMPD_ROOT';
  private constructor(public readonly itemType: string, public readonly compoundItemId: CompoundItemId) {}

  public static fromItemId(itemType: string, itemId: string): CompoundKey {
    return new CompoundKey(itemType, CompoundItemId.fromItemId(itemId));
  }

  public static fromAttributeMap(map: AttributeMap, partitionKey = 'pk', sortKey = 'sk'): CompoundKey {
    const dynamoItem = new DynamoItem(map);
    const noParent = dynamoItem.toString(partitionKey)! === CompoundKey.DEFAULT_PARENT;
    return new CompoundKey(
      dynamoItem.toStringPart(sortKey, 0)!,
      CompoundItemId.fromKeys(dynamoItem.toString(partitionKey)!, dynamoItem.toString(sortKey)!, noParent),
    );
  }

  public get partitionKey(): string {
    return this.hasParent() ? formatValue(...this.compoundItemId.parentIdParts) : CompoundKey.DEFAULT_PARENT;
  }

  public get sortKey(): string {
    return formatValue(this.itemType, this.compoundItemId.name);
  }

  public toKey(partitionKey = 'pk', sortKey = 'sk'): Key {
    return {
      [partitionKey]: {
        S: this.partitionKey,
      },
      [sortKey]: {
        S: this.sortKey,
      },
    };
  }

  private hasParent(): boolean {
    return !!this.compoundItemId.parentId;
  }

  public static toPartitionKey(parentId?: string): string {
    return parentId ? formatValue(...CompoundItemId.fromItemId(parentId).idParts) : CompoundKey.DEFAULT_PARENT;
  }

  public static toSortKey(itemType: string, itemId: string): string {
    return formatValue(itemType, CompoundItemId.toName(itemId));
  }
}
