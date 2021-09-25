import { parseValue } from '../DynamoUtils';

export class CompoundItemId {
  public static readonly ID_SEPARATOR = ':';

  private constructor(public readonly parentId: string, public readonly name: string) {}

  public static fromItemId(itemId: string): CompoundItemId {
    return new CompoundItemId(CompoundItemId.toParentId(itemId), CompoundItemId.toName(itemId));
  }

  public static fromKeys(partitionKey: string, sortKey: string): CompoundItemId {
    return new CompoundItemId(parseValue(partitionKey).join(CompoundItemId.ID_SEPARATOR), parseValue(sortKey).pop()!);
  }

  public static create(parentId: string, name: string): CompoundItemId {
    return new CompoundItemId(parentId, name);
  }

  public get itemId(): string {
    return [this.parentId, this.name].join(CompoundItemId.ID_SEPARATOR);
  }

  public get idParts(): string[] {
    return this.itemId.split(CompoundItemId.ID_SEPARATOR);
  }

  public get parentIdParts(): string[] {
    return this.parentId.split(CompoundItemId.ID_SEPARATOR);
  }

  public static toParentId(itemId: string): string {
    return itemId
      .split(CompoundItemId.ID_SEPARATOR)
      .slice(0, -1)
      .join(this.ID_SEPARATOR);
  }

  public static toName(itemId: string): string {
    return itemId.split(CompoundItemId.ID_SEPARATOR).pop()!;
  }
}
