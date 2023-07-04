import { CompoundKey } from '.';
import { parseValue } from '../DynamoUtils';

export class CompoundItemId {
  public static readonly ID_SEPARATOR = ':';

  private constructor(public readonly parentId: string | undefined = undefined, public readonly name: string) {}

  public static fromItemId(itemId: string): CompoundItemId {
    return new CompoundItemId(CompoundItemId.toParentId(itemId), CompoundItemId.toName(itemId));
  }

  public static fromKeys(partitionKey: string, sortKey: string): CompoundItemId {
    const parent =
      partitionKey === CompoundKey.DEFAULT_PARENT
        ? undefined
        : parseValue(partitionKey).join(CompoundItemId.ID_SEPARATOR);
    return new CompoundItemId(parent, parseValue(sortKey).pop()!);
  }

  public static create(parentId: string, name: string): CompoundItemId {
    return new CompoundItemId(parentId, name);
  }

  public withName(name: string): CompoundItemId {
    return new CompoundItemId(this.itemId, name);
  }

  public get itemId(): string {
    return this.parentId ? [this.parentId, this.name].join(CompoundItemId.ID_SEPARATOR) : this.name;
  }

  public get idParts(): string[] {
    return this.itemId.split(CompoundItemId.ID_SEPARATOR);
  }

  public get parentIdParts(): string[] {
    return this.parentId ? this.parentId.split(CompoundItemId.ID_SEPARATOR) : [];
  }

  public static toParentId(itemId: string): string | undefined {
    const rval = itemId.split(CompoundItemId.ID_SEPARATOR).slice(0, -1).join(this.ID_SEPARATOR);
    return rval.length !== 0 ? rval : undefined;
  }

  public static toName(itemId: string): string {
    return itemId.split(CompoundItemId.ID_SEPARATOR).pop()!;
  }
}
