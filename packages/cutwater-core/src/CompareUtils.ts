import { Comparator } from './Comparator';
import { ObjectUtils } from './ObjectUtils';

type Comparable = string | number | Array<string | number> | undefined;
type ComparatorFunction = (
  value: Comparable,
  ...expected: Comparable[]
) => boolean;

const toString = (value: Comparable, defaultValue = ''): string => {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number') {
    return `${value}`;
  }
  if (Array.isArray(value)) {
    return value.map((v) => toString(v)).join(',');
  }
  return defaultValue;
};

const toStringArray = (value: Comparable, defaultValue = []): string[] => {
  if (typeof value === 'string') {
    return value.split(',');
  }
  if (typeof value === 'number') {
    return [`${value}`];
  }
  if (Array.isArray(value)) {
    return value.map((v) => toString(v));
  }
  return defaultValue;
};

export class CompareUtils {
  private static readonly COMPARATORS: Record<Comparator, ComparatorFunction> =
    {
      [Comparator.EQ]: (value: Comparable, expected: Comparable): boolean => {
        return CompareUtils.safeCompare(value, expected) === 0;
      },
      [Comparator.NE]: (value: Comparable, expected: Comparable): boolean => {
        return CompareUtils.safeCompare(value, expected) !== 0;
      },
      [Comparator.NULL]: (value: unknown): boolean => {
        return value === null || value === undefined;
      },
      [Comparator.NOT_NULL]: (value: unknown): boolean => {
        return value !== null && value !== undefined;
      },
      [Comparator.GT]: (value: Comparable, expected: Comparable): boolean => {
        return CompareUtils.safeCompare(value, expected) > 0;
      },
      [Comparator.GE]: (value: Comparable, expected: Comparable): boolean => {
        return CompareUtils.safeCompare(value, expected) >= 0;
      },
      [Comparator.LT]: (value: Comparable, expected: Comparable): boolean => {
        return CompareUtils.safeCompare(value, expected) < 0;
      },
      [Comparator.LE]: (value: Comparable, expected: Comparable): boolean => {
        return CompareUtils.safeCompare(value, expected) <= 0;
      },
      [Comparator.BETWEEN]: (
        value: Comparable,
        first: Comparable,
        last: Comparable
      ): boolean => {
        return (
          CompareUtils.safeCompare(toString(value), toString(first)) >= 0 &&
          CompareUtils.safeCompare(toString(value), toString(last)) <= 0
        );
      },
      [Comparator.CONTAINS]: (
        value: Comparable,
        expected: Comparable
      ): boolean => {
        if (!value) {
          return false;
        }
        if (typeof value === 'string') {
          return value.indexOf(`${expected}`) !== -1;
        } else {
          return (
            toStringArray(value).find(
              (cur) => CompareUtils.safeCompare(cur, expected) === 0
            ) !== undefined
          );
        }
      },
      [Comparator.NOT_CONTAINS]: (
        value: Comparable,
        expected: Comparable
      ): boolean => {
        if (!value) {
          return true;
        }
        if (typeof value === 'string') {
          return value.indexOf(`${expected}`) === -1;
        } else {
          return (
            toStringArray(value).find(
              (cur) => CompareUtils.safeCompare(cur, expected) === 0
            ) === undefined
          );
        }
      },
      [Comparator.IN]: (value: Comparable, expected: Comparable): boolean => {
        return value
          ? toStringArray(expected).includes(toString(value))
          : false;
      },
      [Comparator.BEGINS_WITH]: (
        value: Comparable,
        expected: Comparable
      ): boolean => {
        return value ? toString(value).startsWith(toString(expected)) : false;
      },
    };

  private static toSafeString(value: Comparable): string {
    return value ? `${value}` : '';
  }

  private static toSafeNumber(value: Comparable): number {
    const safeVal = CompareUtils.toSafeString(value);
    const isFloat = safeVal.indexOf('.') !== -1;
    return isFloat ? parseFloat(safeVal) : value ? parseInt(safeVal) : -1;
  }

  private static compareAs(
    a: Comparable,
    b: Comparable,
    type: string
  ): boolean {
    const typeA = typeof a;
    const typeB = typeof b;
    return typeA === type || (a === undefined && typeB === type);
  }

  public static safeCompare(a: Comparable, b: Comparable): number {
    let rval = 0;
    if (CompareUtils.compareAs(a, b, 'string')) {
      rval = CompareUtils.toSafeString(a).localeCompare(
        CompareUtils.toSafeString(b)
      );
    } else if (CompareUtils.compareAs(a, b, 'number')) {
      rval = CompareUtils.toSafeNumber(a) - CompareUtils.toSafeNumber(b);
    }
    return rval;
  }

  public static compare(
    value: Comparable,
    comp: Comparator,
    ...expected: Comparable[]
  ): boolean {
    return CompareUtils.COMPARATORS[comp](value, ...expected);
  }

  public static filter(
    obj: Record<string, unknown>,
    path: string,
    comp: Comparator,
    ...expected: Comparable[]
  ): boolean {
    return CompareUtils.compare(
      ObjectUtils.findProperty(obj, path) as Comparable,
      comp,
      ...expected
    );
  }
}
