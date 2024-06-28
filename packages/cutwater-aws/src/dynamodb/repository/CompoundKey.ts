import { AttributeMap } from '../AttributeMap';
import { CompoundValue } from '../CompoundValue';
import { DynamoItem } from '../DynamoItem';
import { CompoundItemId } from './CompoundItemId';

export class CompoundKey {
  public static readonly DEFAULT_PARENT = 'CMPD_ROOT';
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
    return this.hasParent()
      ? CompoundValue.create(...this.compoundItemId.parentIdParts).value
      : CompoundKey.DEFAULT_PARENT;
  }

  public get sortKey(): string {
    return CompoundValue.create(this.itemType, this.compoundItemId.name).value;
  }

  public toKey(partitionKey = 'pk', sortKey = 'sk'): AttributeMap {
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
    return parentId
      ? CompoundValue.create(...CompoundItemId.fromItemId(parentId).idParts).value
      : CompoundKey.DEFAULT_PARENT;
  }

  public static toSortKey(itemType: string, itemId: string): string {
    return CompoundValue.create(itemType, CompoundItemId.toName(itemId)).value;
  }
}
