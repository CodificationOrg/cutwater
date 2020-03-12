import { TextUtils } from './TextUtils';

describe('TextUtils', () => {
  it('can convert camel case to dashes', () => {
    expect(TextUtils.convertCamelCaseToDash('typicalPropName')).toEqual('typical-prop-name');
  });

  it('can convert camel case config to arg', () => {
    expect(TextUtils.convertPropertyNameToArg('typicalPropName')).toEqual('--typical-prop-name');
  });
});
