import { AttributeMap, Key } from 'aws-sdk/clients/dynamodb';
import { DynamoItem, formatValue } from '..';
import { CompoundItemId } from './CompoundItemId';

export class CompoundKey {
  private constructor(public readonly itemType: string, public readonly compoundItemId: CompoundItemId) {}

  public static fromItemId(itemType: string, itemId: string): CompoundKey {
    return new CompoundKey(itemType, CompoundItemId.fromItemId(itemId));
  }

  public static fromAttributeMap(map: AttributeMap, partitionKey = 'pk', sortKey = 'sk'): CompoundKey {
    const dynamoItem = new DynamoItem(map);
    return new CompoundKey(
      dynamoItem.toStringPart(sortKey, 0)!,
      CompoundItemId.fromKeys(dynamoItem.toString(partitionKey)!, dynamoItem.toString(sortKey)!),
    );
  }

  public get partitionKey(): string {
    return formatValue(...this.compoundItemId.parentIdParts);
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

  public static toPartitionKey(parentId: string): string {
    return formatValue(...CompoundItemId.fromItemId(parentId).idParts);
  }

  public static toSortKey(itemType: string, itemId: string): string {
    return formatValue(itemType, CompoundItemId.toName(itemId));
  }
}
