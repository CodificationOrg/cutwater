import { TZUtils } from './TZUtils';

describe('TZUtils', () => {
  it('can reset the timezone offset', () => {
    TZUtils.resetTimezoneOffset();
    expect(TZUtils.timezoneOffset).toBe(TZUtils.DEFAULT_OFFSET);
  });

  it('can return the timezone offset', () => {
    const offset: number = 7 * 60 * -1;
    TZUtils.timezoneOffset = offset;
    expect(TZUtils.timezoneOffset).toBe(offset);
  });

  it('can generate a timestamp string value', () => {
    expect(TZUtils.timestamp()).toBeDefined();
  });
});
