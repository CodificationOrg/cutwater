import { formatValue } from '..';
import { CompoundItemId } from './CompoundItemId';

export class CompoundKey {
  private constructor(private readonly itemType: string, public readonly compoundItemId: CompoundItemId) {}

  public static fromItemId(itemType: string, itemId: string): CompoundKey {
    return new CompoundKey(itemType, CompoundItemId.fromItemId(itemId));
  }

  public get partitionKey(): string {
    return formatValue(...this.compoundItemId.parentIdParts);
  }

  public get sortKey(): string {
    return formatValue(this.itemType, this.compoundItemId.name);
  }

  public static toPartitionKey(parentId: string): string {
    return formatValue(...CompoundItemId.fromItemId(parentId).idParts);
  }

  public static toSortKey(itemType: string, itemId: string): string {
    return formatValue(itemType, CompoundItemId.toName(itemId));
  }
}
