import * as gulp from 'gulp';
import { initialize } from '.';
import { coreBuildPackage } from './State';

beforeAll(() => {
  initialize(gulp);
});

describe('State coreBuildPackage resource', () => {
  it('should return the resource', () => {
    expect(coreBuildPackage).toBeTruthy();
  });
  it('should return the module name', () => {
    expect(coreBuildPackage.name).toBe('@codification/cutwater-build-core');
  });
  it('should return the module version', () => {
    expect(coreBuildPackage.version).toBeTruthy();
  });
});
