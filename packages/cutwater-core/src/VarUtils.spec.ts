import { VarUtils } from './VarUtils';

describe('VarUtils Unit Tests', () => {
    test('isMissing', () => {
        // tslint:disable-next-line: no-null-keyword
        expect(VarUtils.isMissing(null)).toBeTruthy();
        expect(VarUtils.isMissing(undefined)).toBeTruthy();
        expect(VarUtils.isMissing('')).toBeFalsy();
    });

    test('isPresent', () => {
        expect(VarUtils.isPresent('foo')).toBeTruthy();
        expect(VarUtils.isPresent('')).toBeTruthy();
        expect(VarUtils.isPresent(0)).toBeTruthy();
    });
});
