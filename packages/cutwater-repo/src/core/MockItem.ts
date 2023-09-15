import { ItemPropertyDescriptor } from './ItemPropertyDescriptor';

export interface RandomRange {
  min?: number;
  max: number;
}

export class MockItem {
  public static readonly ITEM_DESCRIPTOR = new ItemPropertyDescriptor(
    'MockItem',
    'userId',
    'groupId'
  );

  public static createNullable(baseNumber = 0): MockItem {
    const groupId = `${baseNumber % 2 ? 'a' : 'b'}`;
    const userId = `${baseNumber}`;
    return new MockItem(groupId, userId, `name${baseNumber}`, baseNumber);
  }

  public static createNullables(count: number | RandomRange = 25): MockItem[] {
    const itemCount =
      typeof count === 'number'
        ? count
        : Math.max(Math.floor(Math.random() * count.max + 1), count.min || 1);
    return Array.from(Array(itemCount)).map((el, i) =>
      MockItem.createNullable(i)
    );
  }

  private constructor(
    public groupId: string,
    public userId: string,
    public name: string,
    public age: number
  ) {}
}
