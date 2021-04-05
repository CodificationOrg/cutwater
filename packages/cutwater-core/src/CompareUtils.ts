import { Comparator } from './Comparator';
import { ObjectUtils } from './ObjectUtils';

type comparable = string | number | undefined;
type ComparatorFunction = (value: any, ...expected: any) => boolean;

export class CompareUtils {
  private static readonly COMPARATORS: Record<Comparator, ComparatorFunction> = {
    [Comparator.EQ]: (value: comparable, expected: comparable): boolean => {
      return CompareUtils.safeCompare(value, expected) === 0;
    },
    [Comparator.NE]: (value: comparable, expected: comparable): boolean => {
      return CompareUtils.safeCompare(value, expected) !== 0;
    },
    [Comparator.NULL]: (value: any): boolean => {
      return value === null || value === undefined;
    },
    [Comparator.NOT_NULL]: (value: any): boolean => {
      return value !== null && value !== undefined;
    },
    [Comparator.GT]: (value: comparable, expected: comparable): boolean => {
      return CompareUtils.safeCompare(value, expected) > 0;
    },
    [Comparator.GE]: (value: comparable, expected: comparable): boolean => {
      return CompareUtils.safeCompare(value, expected) >= 0;
    },
    [Comparator.LT]: (value: comparable, expected: comparable): boolean => {
      return CompareUtils.safeCompare(value, expected) < 0;
    },
    [Comparator.LE]: (value: comparable, expected: comparable): boolean => {
      return CompareUtils.safeCompare(value, expected) <= 0;
    },
    [Comparator.BETWEEN]: (value: comparable, first: comparable, last: comparable): boolean => {
      return CompareUtils.safeCompare(value, first) >= 0 && CompareUtils.safeCompare(value, last) <= 0;
    },
    [Comparator.CONTAINS]: (value: string | Array<string | number>, expected: string | number): boolean => {
      if (typeof value === 'string') {
        return value.indexOf(`${expected}`) !== -1;
      } else {
        return value.find(cur => CompareUtils.safeCompare(cur, expected) === 0) !== undefined;
      }
    },
    [Comparator.NOT_CONTAINS]: (value: string | Array<string | number>, expected: string | number): boolean => {
      if (typeof value === 'string') {
        return value.indexOf(`${expected}`) === -1;
      } else {
        return value.find(cur => CompareUtils.safeCompare(cur, expected) === 0) === undefined;
      }
    },
    [Comparator.IN]: (value: string | number, expected: Array<string | number>): boolean => {
      return expected.includes(value);
    },
    [Comparator.BEGINS_WITH]: (value: string, expected: string): boolean => {
      return value.startsWith(expected);
    },
  };

  private static toSafeString(value: comparable): string {
    return !!value ? `${value}` : '';
  }

  private static toSafeNumber(value: comparable): number {
    return !!value ? parseInt(CompareUtils.toSafeString(value)) : -1;
  }

  private static compareAs(a: comparable, b: comparable, type: string): boolean {
    const typeA = typeof a;
    const typeB = typeof b;
    return typeA === type || (a === undefined && typeB === type);
  }

  public static safeCompare(a: comparable, b: comparable): number {
    let rval = 0;
    if (CompareUtils.compareAs(a, b, 'string')) {
      rval = CompareUtils.toSafeString(a).localeCompare(CompareUtils.toSafeString(b));
    } else if (CompareUtils.compareAs(a, b, 'number')) {
      rval = CompareUtils.toSafeNumber(a) - CompareUtils.toSafeNumber(b);
    }
    return rval;
  }

  public static compare(value: any, comp: Comparator, ...expected: any): boolean {
    return CompareUtils.COMPARATORS[comp](value, ...expected);
  }

  public static filter(obj: Record<string, any>, path: string, comp: Comparator, ...expected: any): boolean {
    return CompareUtils.compare(ObjectUtils.findProperty(obj, path), comp, ...expected);
  }
}
