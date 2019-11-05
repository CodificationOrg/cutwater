import { TZUtils } from './TZUtils';

describe('TZUtils Unit Tests', () => {
  test('resetTimezoneOffset', () => {
    TZUtils.resetTimezoneOffset();
    expect(TZUtils.timezoneOffset).toBe(TZUtils.DEFAULT_OFFSET);
  });

  test('timezoneOffset', () => {
    const offset: number = 7 * 60 * -1;
    TZUtils.timezoneOffset = offset;
    expect(TZUtils.timezoneOffset).toBe(offset);
  });

  test('timestamp', () => {
    expect(TZUtils.timestamp()).toBeDefined();
  });
});
