import { BuildStateImpl } from './BuildStateImpl';

describe('BuildStateImpl', () => {
  const { toolPackage } = BuildStateImpl.instance;

  describe('coreBuildPackage', () => {
    it('should return the resource', () => {
      expect(toolPackage).toBeTruthy();
    });
    it('should return the module name', () => {
      expect(toolPackage.name).toBe('@codification/cutwater-build-core');
    });
    it('should return the module version', () => {
      expect(toolPackage.version).toBeTruthy();
    });
  });
});
