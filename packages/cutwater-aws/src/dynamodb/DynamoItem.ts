import { AttributeMap, AttributeValue } from 'aws-sdk/clients/dynamodb';
import { formatValue, parseValue } from './DynamoUtils';

enum ValueType {
  S = 'S',
  N = 'N',
  B = 'B',
  SS = 'SS',
  NS = 'NS',
  BS = 'BS',
  M = 'M',
  L = 'L',
  NULL = 'NULL',
  BOOL = 'BOOL',
}

export class DynamoItem {
  public constructor(public item: AttributeMap = {}) {}

  public prune(): AttributeMap {
    const removes: string[] = [];
    Object.keys(this.item).forEach(att => {
      if (this.isEmtptyAttribute(att)) {
        removes.push(att);
      }
    });
    removes.forEach(att => delete this.item[att]);
    return this.item;
  }

  public toSafeString(key: string): string {
    return this.toString(key, '')!;
  }

  public toString(key: string, defaultValue?: string): string | undefined {
    return this.getValue<string>(key, ValueType.S) || defaultValue;
  }

  public setString(key: string, value?: string): void {
    if (value !== undefined) {
      this.item[key] = {
        S: value,
      };
    }
  }

  public setStringParts(key: string, ...values: Array<string | number | undefined>): void {
    if (values && values.length > 0) {
      this.setString(key, formatValue(...values));
    }
  }

  public toStringSet(key: string, defaultValue: string[] = []): string[] {
    return this.getValue<string[]>(key, ValueType.SS) || defaultValue;
  }

  public setStringSet(key: string, value?: string[]): void {
    if (value && value.length > 0) {
      this.item[key] = {
        SS: value,
      };
    }
  }

  public toSafeNumber(key: string): number {
    return this.toNumber(key, -1)!;
  }

  public toNumber(key: string, defaultValue?: number): number | undefined {
    const value = this.getValue<string>(key, ValueType.N);
    return value ? +value : defaultValue;
  }

  public setNumber(key: string, value?: number): void {
    if (value !== undefined) {
      this.item[key] = {
        N: value.toString(),
      };
    }
  }

  public toBoolean(key: string, defaultValue = false): boolean {
    const value = this.getValue<boolean>(key, ValueType.BOOL);
    return value !== undefined ? value : defaultValue;
  }

  public setBoolean(key: string, value?: boolean): void {
    if (value !== undefined) {
      this.item[key] = {
        BOOL: value,
      };
    }
  }

  public toStringPart(key: string, index: number, defaultValue?: string): string | undefined {
    const parts = parseValue(this.getValue<string>(key, ValueType.S));
    return parts.length > index ? parts[index] : defaultValue;
  }

  public toNumberPart(key: string, index: number, defaultValue?: number): number | undefined {
    const value = this.toStringPart(key, index);
    return value ? +value : defaultValue;
  }

  protected getValue<T>(key: string, type: ValueType): T | undefined {
    return this.item[key] && this.item[key][type] ? (this.item[key][type] as T) : undefined;
  }

  protected isEmtptyAttribute(key: string): boolean {
    const attValue: AttributeValue = this.item[key];
    let attKey = Object.keys(attValue).find(k => attValue[k] !== undefined);
    if (!!attKey && Array.isArray(attValue[attKey]) && attValue[attKey].length === 0) {
      attKey = undefined;
    }
    return attKey === undefined;
  }
}
