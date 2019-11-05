import { TimeUnit } from './TimeUnit';

describe('TimeUnit Unit Tests', () => {
  test('days', () => {
    const result: TimeUnit = TimeUnit.days(2);
    expect(result.toDays()).toBe(2);
    expect(result.toHours()).toBe(48);
  });

  test('hours', () => {
    const result: TimeUnit = TimeUnit.hours(2);
    expect(result.toHours()).toBe(2);
    expect(result.toMinutes()).toBe(120);
    expect(result.toDays()).toBe(0);
  });

  test('minutes', () => {
    const result: TimeUnit = TimeUnit.minutes(60);
    expect(result.toHours()).toBe(1);
    expect(result.toMinutes()).toBe(60);
    expect(result.toSeconds()).toBe(60 * 60);
  });

  test('seconds', () => {
    const result: TimeUnit = TimeUnit.seconds(120);
    expect(result.toHours()).toBe(0);
    expect(result.toMinutes()).toBe(2);
    expect(result.toSeconds()).toBe(120);
    expect(result.toMillis()).toBe(120000);
  });

  test('milliseconds', () => {
    const result: TimeUnit = TimeUnit.millis(1200);
    expect(result.toHours()).toBe(0);
    expect(result.toMinutes()).toBe(0);
    expect(result.toSeconds()).toBe(1);
    expect(result.toMillis()).toBe(1200);
  });
});
