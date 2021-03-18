import { VarUtils } from './VarUtils';

describe('VarUtils', () => {
  it('can determine if a value is missing', () => {
    expect(VarUtils.isMissing(null)).toBeTruthy();
    expect(VarUtils.isMissing(undefined)).toBeTruthy();
    expect(VarUtils.isMissing('')).toBeFalsy();
  });

  it('can determine if a value is present', () => {
    expect(VarUtils.isPresent('foo')).toBeTruthy();
    expect(VarUtils.isPresent('')).toBeTruthy();
    expect(VarUtils.isPresent(0)).toBeTruthy();
  });
});
